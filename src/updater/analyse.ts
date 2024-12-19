/* eslint-disable import-x/no-unused-modules */

import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../core/analyse.ts';
import seasons from '../data/generated/seasons.json' with { type: 'json' };

import {
    RIO_MAX_PAGE,
    RIO_CURRENT_SEASON,
    RIO_CURRENT_SEASON_MIN_LEVEL,
} from './config.ts';
import fetcher from './fetcher.ts';
import getSeasonInfo from './season.ts';

import type { AnalyseDataFile } from '../core/types.ts';

const outputFilePath = path.resolve(process.argv[2]);

const {
    season,
    level: runMinLevel,
    score: runMinScore,
    allWeeksMultiplier,
    ignoreSpecs,
    skipCharacterBest,
} = (() => {
    const useOldSeason = process.argv.length > 3;
    if (useOldSeason) {
        const inputSeason = process.argv[3];
        if (!(inputSeason in seasons)) {
            throw new Error(`Unknown season: ${inputSeason}`);
        }

        const slug = inputSeason as keyof typeof seasons;
        const info = getSeasonInfo(slug);

        return {
            season: slug,
            ...info,
        };
    }

    const info = getSeasonInfo(RIO_CURRENT_SEASON, RIO_CURRENT_SEASON_MIN_LEVEL);

    return {
        season: RIO_CURRENT_SEASON,
        ...info,
    };
})();

fetcher(
    RIO_MAX_PAGE,
    season,
    runMinLevel,
    runMinScore,
    allWeeksMultiplier,
    ignoreSpecs,
    skipCharacterBest,
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
            config: {
                maxPage: RIO_MAX_PAGE,
                season,
                runMinLevel,
                runMinScore,
                allWeeksMultiplier,
                ignoreSpecs,
                skipCharacterBest,
            },
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
