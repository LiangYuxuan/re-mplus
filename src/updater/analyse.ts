/* eslint-disable import-x/no-unused-modules */

import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../core/analyse.ts';

import { RIO_SEASON } from './config.ts';
import fetcher from './fetcher.ts';

import type { AnalyseDataFile } from '../core/types.ts';

const outputFilePath = path.resolve(process.argv[2]);

fetcher()
    .then(({
        date,
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    }) => {
        const data: AnalyseDataFile = {
            date,
            season: RIO_SEASON,
            dungeonsByRuns: analyse(dungeonsByRuns),
            specsByRuns: analyse(specsByRuns),
            specsByCharacters: analyse(specsByCharacters),
        };
        const dataText = JSON.stringify(data);

        return fs.writeFile(outputFilePath, dataText);
    })
    .then()
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
