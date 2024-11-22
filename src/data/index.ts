/* eslint-disable import-x/no-unused-modules */

import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CASCClient, WDCReader, DBDParser } from '@rhyster/wow-casc-dbc';
import { timesSeries } from 'async';
import { Jimp } from 'jimp';

import BLPReader from './blp.ts';
import { latestVersion } from './client.ts';
import { getMythicPlusStaticData } from './rio.ts';

const challengeMapID2SpecialIconID = new Map<number, number>([
    [227, 1530372], // Return to Karazhan: Lower
    [234, 1417424], // Return to Karazhan: Upper
    [369, 2574427], // Operation: Mechagon - Junkyard
    [370, 3024540], // Operation: Mechagon - Workshop
    [391, 4062727], // Tazavesh: Streets of Wonder
    [392, 3601562], // Tazavesh: So'leah's Gambit
    [463, 4622479], // Dawn of the Infinite: Galakrond's Fall
    [464, 5247561], // Dawn of the Infinite: Murozond's Rise
]);

const ignoredSpecialization = [
    1444, // Initial Shaman
    1446, // Initial Warrior
    1447, // Initial Druid
    1448, // Initial Hunter
    1449, // Initial Mage
    1450, // Initial Monk
    1451, // Initial Paladin
    1452, // Initial Priest
    1453, // Initial Rogue
    1454, // Initial Warlock
    1455, // Initial Death Knight
    1456, // Initial Demon Hunter
    1465, // Initial Evoker
    1478, // Adventurer Adventurer
];

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');

const client = new CASCClient('us', latestVersion.product, latestVersion.version);
await client.init();

console.info(new Date().toISOString(), '[INFO]: Loading remote TACT keys');
await client.loadRemoteTACTKeys();
console.info(new Date().toISOString(), '[INFO]: Loaded remote TACT keys');

const loadFile = async (fileDataID: number, localeFlag: number) => {
    const cKeys = client.getContentKeysByFileDataID(fileDataID);
    assert(cKeys, `No cKeys found for fileDataID ${fileDataID.toString()}`);

    const cKey = cKeys
        // eslint-disable-next-line no-bitwise
        .find((data) => !!(data.localeFlags & localeFlag));
    assert(cKey, `No cKey found for fileDataID ${fileDataID.toString()} in enUS`);

    const data = await client.getFileByContentKey(cKey.cKey, true);

    return data;
};

const loadDB2 = async (fileDataID: number, localeFlag: number) => {
    const data = await loadFile(fileDataID, localeFlag);
    const reader = new WDCReader(data.buffer, data.blocks);
    const parser = await DBDParser.parse(reader);

    return parser;
};

const blpFileCutToPNG = async (fileDataID: number) => {
    const data = await loadFile(fileDataID, CASCClient.LocaleFlags.enUS);
    const { rgba, width, height } = new BLPReader(new Uint8Array(data.buffer)).processMipmap(0);

    const xCutSize = Math.floor(width / 16);
    const yCutSize = Math.floor(height / 16);

    const newWidth = width - 2 * xCutSize;
    const newHeight = height - 2 * yCutSize;

    const buffer = Buffer.alloc(newWidth * newHeight * 4);
    for (let i = 0; i < newHeight; i += 1) {
        const src = (i + yCutSize) * width * 4 + xCutSize * 4;
        buffer.set(rgba.slice(src, src + newWidth * 4), i * newWidth * 4);
    }

    const image = new Jimp({ data: buffer, width: newWidth, height: newHeight });
    const png = await image.getBuffer('image/png');

    return png;
};

console.info(new Date().toISOString(), '[INFO]: Loading DB2 files');
const [
    expansions,
    journalInstance,
    mapChallengeMode,
    mapChallengeModeCN,
    chrSpecialization,
    chrSpecializationCN,
    chrClasses,
    chrClassesCN,
] = await Promise.all([
    loadDB2(1729547, CASCClient.LocaleFlags.enUS), // dbfilesclient/uiexpansiondisplayinfo.db2
    loadDB2(1237438, CASCClient.LocaleFlags.enUS), // dbfilesclient/journalinstance.db2
    loadDB2(801709, CASCClient.LocaleFlags.enUS), // dbfilesclient/mapchallengemode.db2
    loadDB2(801709, CASCClient.LocaleFlags.zhCN), // dbfilesclient/mapchallengemode.db2
    loadDB2(1343390, CASCClient.LocaleFlags.enUS), // dbfilesclient/chrspecialization.db2
    loadDB2(1343390, CASCClient.LocaleFlags.zhCN), // dbfilesclient/chrspecialization.db2
    loadDB2(1361031, CASCClient.LocaleFlags.enUS), // dbfilesclient/chrclasses.db2
    loadDB2(1361031, CASCClient.LocaleFlags.zhCN), // dbfilesclient/chrclasses.db2
]);
console.info(new Date().toISOString(), '[INFO]: Loaded DB2 files');

console.info(new Date().toISOString(), '[INFO]: Parsing DB2 files');
const mapID2IconID = new Map<number, number>(journalInstance.getAllIDs().map((id) => {
    const row = journalInstance.getRowData(id);
    const mapID = row?.MapID as number;
    const buttonSmallFileDataID = row?.ButtonSmallFileDataID as number;

    return [mapID, buttonSmallFileDataID] as const;
}));

const challengeMapID2Name = new Map<number, string>();
const challengeMapID2IconID = new Map<number, number>();
mapChallengeMode.getAllIDs().forEach((id) => {
    const row = mapChallengeMode.getRowData(id);
    const mapID = row?.MapID as number;
    const name = row?.Name_lang;

    assert(typeof name === 'string', `No name found for challenge map ID ${id.toString()} mapID ${mapID.toString()}`);
    challengeMapID2Name.set(id, name);

    const specialIcon = challengeMapID2SpecialIconID.get(id);
    const iconID = mapID2IconID.get(mapID);
    assert(iconID !== undefined, `No iconID found for challenge map ID ${id.toString()} mapID ${mapID.toString()}`);

    challengeMapID2IconID.set(id, specialIcon ?? iconID);
});

const challengeMapID2NameCN = new Map<number, string>();
mapChallengeModeCN.getAllIDs().forEach((id) => {
    const row = mapChallengeModeCN.getRowData(id);
    const name = row?.Name_lang;

    assert(typeof name === 'string', `No name found for challenge map ID ${id.toString()}`);
    challengeMapID2NameCN.set(id, name);
});

const classID2Name = new Map<number, string>(chrClasses.getAllIDs().map((id) => {
    const row = chrClasses.getRowData(id);
    const name = row?.Name_lang;

    assert(typeof name === 'string', `No name found for class ID ${id.toString()}`);

    return [id, name] as const;
}));

const classID2NameCN = new Map<number, string>(chrClassesCN.getAllIDs().map((id) => {
    const row = chrClassesCN.getRowData(id);
    const name = row?.Name_lang;

    assert(typeof name === 'string', `No name found for class ID ${id.toString()}`);

    return [id, name] as const;
}));

const specID2IconID = new Map<number, number>();

const specializations = chrSpecialization.getAllIDs().map((id) => {
    const row = chrSpecialization.getRowData(id);
    const classID = row?.ClassID as number;
    const role = row?.Role as number;
    const spellIconFileID = row?.SpellIconFileID as number;
    const primaryStatPriority = row?.PrimaryStatPriority as number;
    const name = row?.Name_lang;

    assert(typeof name === 'string', `No name found for specialization ID ${id.toString()}`);

    if (classID === 0 || ignoredSpecialization.includes(id)) {
        return undefined;
    }

    const rowCN = chrSpecializationCN.getRowData(id);
    const nameCN = rowCN?.Name_lang;

    assert(typeof nameCN === 'string', `No name found for specialization ID ${id.toString()}`);

    const className = classID2Name.get(classID);

    assert(className !== undefined, `No class name found for specialization ID ${id.toString()}`);

    const classNameCN = classID2NameCN.get(classID);

    assert(classNameCN !== undefined, `No class name found for specialization ID ${id.toString()}`);

    specID2IconID.set(id, spellIconFileID);

    if (role === 0) {
        return {
            id,
            role: 'tank',
            className: className.toLocaleLowerCase().replace(' ', '-'),
            specName: name.toLocaleLowerCase().replace(' ', '-'),
            en: `${name} ${className}`,
            cn: `${nameCN}${classNameCN}`,
        };
    }

    if (role === 1) {
        return {
            id,
            role: 'healer',
            className: className.toLocaleLowerCase().replace(' ', '-'),
            specName: name.toLocaleLowerCase().replace(' ', '-'),
            en: `${name} ${className}`,
            cn: `${nameCN}${classNameCN}`,
        };
    }

    if (role === 2 && primaryStatPriority === 0) {
        return {
            id,
            role: 'ranged',
            className: className.toLocaleLowerCase().replace(' ', '-'),
            specName: name.toLocaleLowerCase().replace(' ', '-'),
            en: `${name} ${className}`,
            cn: `${nameCN}${classNameCN}`,
        };
    }

    return {
        id,
        role: 'melee',
        className: className.toLocaleLowerCase().replace(' ', '-'),
        specName: name.toLocaleLowerCase().replace(' ', '-'),
        en: `${name} ${className}`,
        cn: `${nameCN}${classNameCN}`,
    };
}).filter((spec) => spec !== undefined);
console.info(new Date().toISOString(), '[INFO]: Parsed DB2 files');

console.info(new Date().toISOString(), '[INFO]: Parsing Raider.IO static data');
const expansionLength = expansions.getAllIDs().length;
const shortNames = new Map<number, string>();
await timesSeries(expansionLength, async (i: number) => {
    const res = await getMythicPlusStaticData(i);
    if ('seasons' in res) {
        res.seasons.forEach((season) => {
            season.dungeons.forEach(({ challenge_mode_id: id, short_name: shortName }) => {
                shortNames.set(id, shortName);
            });
        });
        res.dungeons.forEach(({ challenge_mode_id: id, short_name: shortName }) => {
            shortNames.set(id, shortName);
        });
    }
});
console.info(new Date().toISOString(), '[INFO]: Parsed Raider.IO static data');

console.info(new Date().toISOString(), '[INFO]: Generating data files');
await fs.mkdir(path.join(root, 'src', 'data', 'generated'), { recursive: true });
await fs.writeFile(path.join(root, 'src', 'data', 'generated', 'map.json'), JSON.stringify({
    abbr: [...shortNames],
    en: [...challengeMapID2Name],
    cn: [...challengeMapID2NameCN],
}, null, 4));
await fs.writeFile(path.join(root, 'src', 'data', 'generated', 'spec.json'), JSON.stringify(specializations, null, 4));
console.info(new Date().toISOString(), '[INFO]: Generated data files');

console.info(new Date().toISOString(), '[INFO]: Downloading icons');
await fs.mkdir(path.join(root, 'static', 'maps'), { recursive: true });
await Promise.all(challengeMapID2IconID.entries().map(async ([mapID, iconID]) => {
    const png = await blpFileCutToPNG(iconID);
    await fs.writeFile(path.join(root, 'static', 'maps', `${mapID.toString()}.png`), png);
}));

await fs.mkdir(path.join(root, 'static', 'specs'), { recursive: true });
await Promise.all(specializations.map(async ({ id }) => {
    const iconID = specID2IconID.get(id);
    assert(iconID !== undefined, `No iconID found for specialization ID ${id.toString()}`);

    const png = await blpFileCutToPNG(iconID);
    await fs.writeFile(path.join(root, 'static', 'specs', `${id.toString()}.png`), png);
}));
console.info(new Date().toISOString(), '[INFO]: Downloaded icons');
