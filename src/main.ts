// import assert from 'node:assert';
import fs from 'node:fs/promises';

import analyse from './analyse.ts';
import ckmeans from './ckmeans.ts';
import { RIO_MIN_LEVEL } from './config.ts';
import { specNames, mapNames } from './locales/zhCN.ts';
import {
    tanks, healers, melees, rangeds,
} from './data.ts';

import type { Run } from './types.ts';

const bucketsName = ['F', 'D', 'C', 'B', 'A', 'S'];

const runs = JSON.parse(await fs.readFile('runs.json', 'utf-8')) as Run[];

const dungeonXRuns = new Map<number, Run[]>();
const tankXRuns = new Map<number, Run[]>();
const healerXRuns = new Map<number, Run[]>();
const meleeXRuns = new Map<number, Run[]>();
const rangedXRuns = new Map<number, Run[]>();

runs.forEach((run) => {
    if (run.level < RIO_MIN_LEVEL) {
        return;
    }

    if (!dungeonXRuns.has(run.map)) {
        dungeonXRuns.set(run.map, []);
    }
    dungeonXRuns.get(run.map)?.push(run);

    run.specs.forEach((spec) => {
        if (tanks.includes(spec)) {
            if (!tankXRuns.has(spec)) {
                tankXRuns.set(spec, []);
            }
            tankXRuns.get(spec)?.push(run);
        }

        if (healers.includes(spec)) {
            if (!healerXRuns.has(spec)) {
                healerXRuns.set(spec, []);
            }
            healerXRuns.get(spec)?.push(run);
        }

        if (melees.includes(spec)) {
            if (!meleeXRuns.has(spec)) {
                meleeXRuns.set(spec, []);
            }
            meleeXRuns.get(spec)?.push(run);
        }

        if (rangeds.includes(spec)) {
            if (!rangedXRuns.has(spec)) {
                rangedXRuns.set(spec, []);
            }
            rangedXRuns.get(spec)?.push(run);
        }
    });
});

const dungeonsResult = analyse(dungeonXRuns).sort((a, b) => a.ci - b.ci);
const dungeonsBuckets = ckmeans(dungeonsResult.map((r) => r.ci), 6);

let dungeonsBucketsIndex = dungeonsBuckets.length - 1;
for (let i = dungeonsResult.length - 1; i >= 0; i -= 1) {
    if (dungeonsBuckets[dungeonsBucketsIndex] > i) {
        dungeonsBucketsIndex -= 1;
    }

    const bucket = bucketsName[dungeonsBucketsIndex];
    const displayName = mapNames.get(dungeonsResult[i].key) ?? dungeonsResult[i].key.toString();
    const nValue = dungeonsResult[i].n.toString();
    const ciValue = dungeonsResult[i].ci.toFixed(1);
    const minLevelValue = dungeonsResult[i].minRun.level.toString();
    const maxLevelValue = dungeonsResult[i].maxRun.level.toString();

    // eslint-disable-next-line no-console
    console.log(`${bucket}\t${displayName}\t${nValue}\t${ciValue}\t${minLevelValue}\t${maxLevelValue}`);
}

[tankXRuns, healerXRuns, meleeXRuns, rangedXRuns].forEach((specXRuns) => {
    // eslint-disable-next-line no-console
    console.log();

    const result = analyse(specXRuns).sort((a, b) => a.ci - b.ci);
    const buckets = ckmeans(result.map((r) => r.ci), 6);

    let bucketsIndex = buckets.length - 1;
    for (let i = result.length - 1; i >= 0; i -= 1) {
        if (buckets[bucketsIndex] > i) {
            bucketsIndex -= 1;
        }

        const bucket = bucketsName[bucketsIndex];
        const displayName = specNames.get(result[i].key) ?? result[i].key.toString();
        const nValue = result[i].n.toString();
        const ciValue = result[i].ci.toFixed(1);
        const minLevelValue = result[i].minRun.level.toString();
        const maxLevelValue = result[i].maxRun.level.toString();

        // eslint-disable-next-line no-console
        console.log(`${bucket}\t${displayName}\t${nValue}\t${ciValue}\t${minLevelValue}\t${maxLevelValue}`);
    }
});
