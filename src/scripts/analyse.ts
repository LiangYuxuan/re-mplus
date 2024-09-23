import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import analyse from '../analyse.ts';
import fetcher from '../fetcher.ts';
import { RIO_MIN_LEVEL } from '../config.ts';

import type { Run, DataFile } from '../types.ts';

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

const data: DataFile = {
    date: new Date().toISOString(),
    dungeons: analyse(dungeonXRuns),
    specs: analyse(specXRuns),
};
const dataText = JSON.stringify(data);

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const resultFilePath = path.join(root, 'data', 'data.json');
await fs.writeFile(resultFilePath, dataText);
const resultPublicFilePath = path.join(root, 'public', 'static', 'data.json');
await fs.writeFile(resultPublicFilePath, dataText);
