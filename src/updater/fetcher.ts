import assert from 'node:assert';

import { mapLimit, retry } from 'async';

import specializations from '../data/generated/specializations.json' with { type: 'json' };

import type { Run, Character, AnalyseInput, RioData } from '../core/types.ts';
import type Runs from './types/Runs.ts';
import type Characters from './types/Characters.ts';
import type StaticData from './types/StaticData.ts';

const getDungeonTopRuns = async (
    season: string,
    region: string,
    dungeon: string,
    page = 0,
): Promise<Runs> => {
    const response = await fetch(`https://raider.io/api/v1/mythic-plus/runs?season=${season}&region=${region}&dungeon=${dungeon}&affixes=all&page=${page.toString()}`);
    const data = await response.json() as Runs;
    return data;
};

const getTopCharacters = async (
    season: string,
    page = 0,
): Promise<Characters> => {
    const response = await fetch(`https://raider.io/api/mythic-plus/rankings/characters?region=world&season=${season}&class=all&role=all&page=${page.toString()}`);
    const data = await response.json() as Characters;
    return data;
};

export default async (
    expansion: number,
    season: string,
    regions: string[],
    maxPage: number,
    minLevel: number,
    minScore: number,
): Promise<RioData> => {
    const staticData = await (await fetch(`https://raider.io/api/v1/mythic-plus/static-data?expansion_id=${expansion.toString()}`)).json() as StaticData;
    const seasonStaticData = staticData.seasons.find((s) => s.slug === season);
    assert(seasonStaticData, `Season ${season} not found`);

    const dungeonCount = seasonStaticData.dungeons.length;
    const dungeonSlugs = seasonStaticData.dungeons.map((d) => d.slug);
    const dungeonMapIDs = seasonStaticData.dungeons.map((d) => d.challenge_mode_id);

    const topRuns: Run[] = [];
    await mapLimit(regions, 1, async (region: string) => {
        await mapLimit(dungeonSlugs, 1, async (dungeon: string) => {
            for (let page = 0; page < maxPage; page += 1) {
                console.info(`Fetching ${region} ${dungeon} page ${(page + 1).toString()}/${maxPage.toString()}`);

                // eslint-disable-next-line no-await-in-loop
                const data = await retry(
                    { times: 3, interval: 1000 },
                    async () => getDungeonTopRuns(season, region, dungeon, page),
                );

                if (data.rankings.length === 0) {
                    break;
                }

                data.rankings.forEach(({ score, run }) => {
                    const id = run.keystone_run_id;
                    const level = run.mythic_level;
                    const mapID = run.dungeon.map_challenge_mode_id;
                    const specs = run.roster.map(({ character }) => character.spec.id);

                    if (level >= minLevel) {
                        topRuns.push({
                            type: 'run',
                            id,
                            mapID,
                            level,
                            score,
                            specs,
                        });
                    }
                });

                if (data.rankings[data.rankings.length - 1].run.mythic_level < minLevel) {
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

    const topCharacters: Character[] = [];
    const characterMaxPage = maxPage * regions.length * 5;
    const characterScoreThreshold = minScore * dungeonCount;
    for (let page = 0; page < characterMaxPage; page += 1) {
        console.info(`Fetching top characters page ${(page + 1).toString()}/${characterMaxPage.toString()}`);

        // eslint-disable-next-line no-await-in-loop
        const data = await retry(
            { times: 3, interval: 1000 },
            async () => getTopCharacters(season, page),
        );

        const characters = data.rankings.rankedCharacters;

        if (characters.length === 0) {
            break;
        }

        characters.forEach(({ score, runs, character: { path, spec: { id } } }) => {
            if (score >= characterScoreThreshold && runs.length >= dungeonCount) {
                const isAllDungeonsValid = runs.every((run) => run.mythicLevel >= minLevel);

                if (isAllDungeonsValid) {
                    topCharacters.push({
                        type: 'character',
                        path: path.replace(/^\/characters\//, ''),
                        score,
                        spec: id,
                    });
                }
            }
        });

        if (characters[characters.length - 1].score < characterScoreThreshold) {
            break;
        }
    }

    const specsByCharacters = specializations.map(({ id }): AnalyseInput => {
        const characters = topCharacters
            .filter((character) => character.spec === id);
        const scores = characters.map((character) => character.score);
        const max = characters[0];
        const min = characters[characters.length - 1];

        return {
            key: id,
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
