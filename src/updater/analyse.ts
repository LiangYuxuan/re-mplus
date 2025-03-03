/* eslint-disable import-x/no-unused-modules */

import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../core/analyse.ts';
import seasons from '../data/generated/seasons.json' with { type: 'json' };

import {
    RIO_MAX_PAGE,
    RIO_CURRENT_SEASON,
    RIO_CURRENT_SEASON_MIN_LEVEL,
    RIO_CURRENT_SEASON_MIN_PER_DUNGEON_SCORE,
} from './config.ts';
import fetcher from './fetcher.ts';
import getSeasonInfo from './season.ts';

import type { AnalyseDataFile } from '../core/types.ts';

const outputFilePath = path.resolve(process.argv[2]);

(async () => {
    const useOldSeason = process.argv.length > 3;
    if (useOldSeason) {
        const inputSeason = process.argv[3];
        if (!(inputSeason in seasons)) {
            throw new Error(`Unknown season: ${inputSeason}`);
        }

        const slug = inputSeason as keyof typeof seasons;
        const info = await getSeasonInfo(slug);

        return {
            season: slug,
            ...info,
        };
    }

    const info = await getSeasonInfo(RIO_CURRENT_SEASON);

    return {
        season: RIO_CURRENT_SEASON,
        ...info,
        dungeonMinLevel: RIO_CURRENT_SEASON_MIN_LEVEL,
        characterMinScore: seasons[RIO_CURRENT_SEASON].dungeons.length
            * RIO_CURRENT_SEASON_MIN_PER_DUNGEON_SCORE,
    };
})()
    .then(({
        season,
        dungeonMinLevel,
        characterMinScore,
        skipCharacterBest,
        usingSpecIDs,
        includePostSeason,
    }) => fetcher(
        RIO_MAX_PAGE,
        season,
        dungeonMinLevel,
        characterMinScore,
        skipCharacterBest,
        usingSpecIDs,
    )
        .then((rioData) => ({
            rioData,
            config: {
                maxPage: RIO_MAX_PAGE,
                season,
                dungeonMinLevel,
                characterMinScore,
                skipCharacterBest,
            },
            includePostSeason,
        })))
    .then(({ rioData, config, includePostSeason }) => {
        const {
            date,
            statistics,
            dungeonsByRuns,
            specsByRuns,
            dungeonsByCharacters,
            specsByCharacters,
        } = rioData;

        const dataFile: AnalyseDataFile = {
            date,
            config,
            statistics: {
                ...statistics,
                includePostSeason,
            },
            dungeonsByRuns: analyse(dungeonsByRuns),
            specsByRuns: analyse(specsByRuns),
            dungeonsByCharacters: analyse(dungeonsByCharacters),
            specsByCharacters: analyse(specsByCharacters),
        };
        const dataFileText = JSON.stringify(dataFile);

        return fs.writeFile(outputFilePath, dataFileText);
    })
    .then()
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
