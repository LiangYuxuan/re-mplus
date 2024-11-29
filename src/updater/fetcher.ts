import assert from 'node:assert';

import { mapLimit, retry } from 'async';

import {
    RIO_MAX_PAGE,
    RIO_REGIONS,
    RIO_EXPANSION_ID,
    RIO_SEASON,
    RIO_MIN_LEVEL,
    RIO_MIN_SCORE,
} from './config.ts';
import specializations from '../data/generated/specializations.json' with { type: 'json' };

import type { BasicRun, AnalyseInput, RioData } from '../core/types.ts';
import type Runs from './types/Runs.ts';
import type Specs from './types/Specs.ts';
import type StaticData from './types/StaticData.ts';

interface Run {
    id: number,
    mapID: number,
    level: number,
    score: number,
    specs: number[],
}

const getDungeonTopRuns = async (
    region: string,
    dungeon: string,
    page = 0,
): Promise<Runs> => {
    const response = await fetch(`https://raider.io/api/v1/mythic-plus/runs?season=${RIO_SEASON}&region=${region}&dungeon=${dungeon}&affixes=all&page=${page.toString()}`);
    const data = await response.json() as Runs;
    return data;
};

const getSpecTopCharacters = async (
    className: string,
    specName: string,
    page = 0,
): Promise<Specs> => {
    const response = await fetch(`https://raider.io/api/mythic-plus/rankings/specs?season=${RIO_SEASON}&region=world&class=${className}&spec=${specName}&page=${page.toString()}`);
    const data = await response.json() as Specs;
    return data;
};

export default async (): Promise<RioData> => {
    const staticData = await (await fetch(`https://raider.io/api/v1/mythic-plus/static-data?expansion_id=${RIO_EXPANSION_ID.toString()}`)).json() as StaticData;
    const seasonStaticData = staticData.seasons.find((s) => s.slug === RIO_SEASON);
    assert(seasonStaticData, `Season ${RIO_SEASON} not found`);

    const dungeonCount = seasonStaticData.dungeons.length;
    const dungeonSlugs = seasonStaticData.dungeons.map((d) => d.slug);
    const dungeonMapIDs = seasonStaticData.dungeons.map((d) => d.challenge_mode_id);

    const topRuns: Run[] = [];
    await mapLimit(RIO_REGIONS, 1, async (region: string) => {
        await mapLimit(dungeonSlugs, 1, async (dungeon: string) => {
            for (let page = 0; page < RIO_MAX_PAGE; page += 1) {
                console.info(`Fetching ${region} ${dungeon} page ${(page + 1).toString()}/${RIO_MAX_PAGE.toString()}`);

                // eslint-disable-next-line no-await-in-loop
                const data = await retry(
                    { times: 3, interval: 1000 },
                    async () => getDungeonTopRuns(region, dungeon, page),
                );

                if (data.rankings.length === 0) {
                    break;
                }

                data.rankings.forEach(({ score, run }) => {
                    const id = run.keystone_run_id;
                    const level = run.mythic_level;
                    const mapID = run.dungeon.map_challenge_mode_id;
                    const specs = run.roster.map(({ character }) => character.spec.id);

                    if (level >= RIO_MIN_LEVEL && score >= RIO_MIN_SCORE) {
                        topRuns.push({
                            id,
                            mapID,
                            level,
                            score,
                            specs,
                        });
                    }
                });

                if (data.rankings[data.rankings.length - 1].score < RIO_MIN_SCORE) {
                    break;
                }
            }
        });
    });

    const dungeonsByRuns: AnalyseInput[] = dungeonMapIDs.map((key) => {
        const runs = topRuns
            .filter((run) => run.mapID === key)
            .toSorted((a, b) => b.score - a.score);
        const scores = runs.map((run) => run.score);
        const max = runs[0];
        const min = runs[runs.length - 1];

        return {
            key,
            scores,
            min,
            max,
        };
    });

    const specsByRuns: AnalyseInput[] = specializations.map(({ id }) => {
        const runs = topRuns
            .filter((run) => run.specs.includes(id))
            .toSorted((a, b) => b.score - a.score);
        const scores = runs.map((run) => run.score);
        const max = runs[0];
        const min = runs[runs.length - 1];

        return {
            key: id,
            scores,
            min,
            max,
        };
    });

    const specsByCharacters = await mapLimit(specializations, 1, async (
        specialization: typeof specializations[number],
    ): Promise<AnalyseInput> => {
        const { id: key, className, specName } = specialization;

        const scores: number[] = [];
        const allRuns: BasicRun[] = [];

        for (let page = 0; page < RIO_MAX_PAGE; page += 1) {
            console.info(`Fetching ${specName} ${className} page ${(page + 1).toString()}/${RIO_MAX_PAGE.toString()}`);

            // eslint-disable-next-line no-await-in-loop
            const data = await retry(
                { times: 3, interval: 1000 },
                async () => getSpecTopCharacters(className, specName, page),
            );

            const characters = data.rankings.rankedCharacters;

            if (characters.length === 0) {
                break;
            }

            characters.forEach(({ score, runs }) => {
                if (runs.length >= dungeonCount) {
                    const isAllDungeonsValid = runs
                        .every((run) => run.mythicLevel >= RIO_MIN_LEVEL
                            && run.score >= RIO_MIN_SCORE);

                    if (isAllDungeonsValid) {
                        scores.push(score);
                        allRuns.push(...runs.map((run) => {
                            const id = run.keystoneRunId;
                            const level = run.mythicLevel;
                            const runScore = run.score;

                            return {
                                id,
                                level,
                                score: runScore,
                            };
                        }));
                    }
                }
            });

            if (characters[characters.length - 1].score < RIO_MIN_SCORE * dungeonCount) {
                break;
            }
        }

        const min = allRuns.reduce(
            (prev, run) => (run.score < prev.score ? run : prev),
            allRuns[0],
        );
        const max = allRuns.reduce(
            (prev, run) => (run.score > prev.score ? run : prev),
            allRuns[0],
        );

        return {
            key,
            scores,
            min,
            max,
        };
    });

    const data: RioData = {
        date: new Date().toISOString(),
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    };

    return data;
};
