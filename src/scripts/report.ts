import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import analyse from '../analyse.ts';
import fetcher from '../fetcher.ts';
import { RIO_MIN_LEVEL } from '../config.ts';
import {
    textDungeon,
    textTank,
    textHealer,
    textMelee,
    textRanged,
    specNames,
    mapNames,
} from '../locales/zhCN.ts';

import type { Run } from '../types.ts';

const tanks = {
    name: textTank,
    specs: [
        250, // Blood Death Knight
        581, // Vengeance Demon Hunter
        104, // Guardian Druid
        268, // Brewmaster Monk
        66, // Protection Paladin
        73, // Protection Warrior
    ],
};

const healers = {
    name: textHealer,
    specs: [
        105, // Restoration Druid
        1468, // Preservation Evoker
        270, // Mistweaver Monk
        65, // Holy Paladin
        256, // Discipline Priest
        257, // Holy Priest
        264, // Restoration Shaman
    ],
};

const melees = {
    name: textMelee,
    specs: [
        251, // Frost Death Knight
        252, // Unholy Death Knight
        577, // Havoc Demon Hunter
        103, // Feral Druid
        255, // Survival Hunter
        269, // Windwalker Monk
        70, // Retribution Paladin
        259, // Assassination Rogue
        260, // Outlaw Rogue
        261, // Subtlety Rogue
        263, // Enhancement Shaman
        71, // Arms Warrior
        72, // Fury Warrior
    ],
};

const rangeds = {
    name: textRanged,
    specs: [
        102, // Balance Druid
        1467, // Devastation Evoker
        1473, // Augmentation Evoker
        253, // Beast Mastery Hunter
        254, // Marksmanship Hunter
        62, // Arcane Mage
        63, // Fire Mage
        64, // Frost Mage
        258, // Shadow Priest
        262, // Elemental Shaman
        265, // Affliction Warlock
        266, // Demonology Warlock
        267, // Destruction Warlock
    ],
};

const specsData = [tanks, healers, melees, rangeds];

const dungeonXRuns = new Map<number, Run[]>();
const specXRuns = new Map<number, Run[]>();

const runs = await fetcher();
runs.forEach((run) => {
    if (run.level < RIO_MIN_LEVEL) {
        return;
    }

    if (!dungeonXRuns.has(run.map)) {
        dungeonXRuns.set(run.map, []);
    }
    dungeonXRuns.get(run.map)?.push(run);

    run.specs.forEach((spec) => {
        if (!specXRuns.has(spec)) {
            specXRuns.set(spec, []);
        }
        specXRuns.get(spec)?.push(run);
    });
});

let reportText = `${textDungeon}\n`;

const dungeonsResult = analyse(dungeonXRuns);
dungeonsResult.forEach(({
    key, tier, n, ci, minRun, maxRun,
}) => {
    const displayName = mapNames.get(key) ?? key.toString();
    const minLevelValue = minRun.level.toString();
    const maxLevelValue = maxRun.level.toString();

    reportText += `${tier}\t${displayName}\t(${minLevelValue} - ${maxLevelValue})\t${n.toString()}\t${ci.toFixed(1)}\n`;
});

const specsResult = analyse(specXRuns);
specsData.forEach(({ name, specs }) => {
    reportText += `${name}\n`;

    specsResult.forEach(({
        key, tier, n, ci, minRun, maxRun,
    }) => {
        if (!specs.includes(key)) {
            return;
        }

        const displayName = specNames.get(key) ?? key.toString();
        const minLevelValue = minRun.level.toString();
        const maxLevelValue = maxRun.level.toString();

        reportText += `${tier}\t${displayName}\t(${minLevelValue} - ${maxLevelValue})\t${n.toString()}\t${ci.toFixed(1)}\n`;
    });
});

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const reportFilePath = path.join(root, 'data', 'report.log');
await fs.writeFile(reportFilePath, reportText);
