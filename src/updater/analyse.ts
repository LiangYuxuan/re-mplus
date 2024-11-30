/* eslint-disable import-x/no-unused-modules */

import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../core/analyse.ts';

import {
    RIO_MAX_PAGE,
    RIO_EXPANSION_ID,
    RIO_SEASON,
    RIO_MIN_LEVEL,
    RIO_MIN_SCORE,
} from './config.ts';
import fetcher from './fetcher.ts';

import type { AnalyseDataFile } from '../core/types.ts';

const outputFilePath = path.resolve(process.argv[2]);

fetcher(
    RIO_EXPANSION_ID,
    RIO_SEASON,
    RIO_MAX_PAGE,
    RIO_MIN_LEVEL,
    RIO_MIN_SCORE,
)
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
