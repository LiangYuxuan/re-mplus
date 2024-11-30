/* eslint-disable import-x/no-unused-modules */

import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../core/analyse.ts';

import {
    RIO_MAX_PAGE,
    RIO_EXPANSION_ID,
    RIO_SEASON,
    RIO_MIN_LEVEL,
} from './config.ts';
import fetcher from './fetcher.ts';

import type { AnalyseDataFile } from '../core/types.ts';

const outputFilePath = path.resolve(process.argv[2]);

fetcher(
    RIO_EXPANSION_ID,
    RIO_SEASON,
    RIO_MAX_PAGE,
    RIO_MIN_LEVEL,
)
    .then(({
        date,
        dungeonMinLevel,
        characterMinScore,
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    }) => {
        const data: AnalyseDataFile = {
            date,
            expansion: RIO_EXPANSION_ID,
            season: RIO_SEASON,
            maxPage: RIO_MAX_PAGE,
            minLevel: RIO_MIN_LEVEL,
            dungeonMinLevel,
            characterMinScore,
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
