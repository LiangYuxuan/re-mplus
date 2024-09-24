import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import analyse from '../analyse.ts';
import fetcher from '../fetcher.ts';
import { RIO_MIN_LEVEL } from '../config.ts';
import {
    tanks, healers, melees, rangeds,
} from '../data.ts';
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

const specsData = [
    { name: textTank, specs: tanks },
    { name: textHealer, specs: healers },
    { name: textMelee, specs: melees },
    { name: textRanged, specs: rangeds },
];

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
