import assert from 'node:assert';

import { mapLimit, retry } from 'async';

import specializations from '../data/generated/specializations.json' with { type: 'json' };

import type Characters from './types/Characters.ts';
import type Runs from './types/Runs.ts';
import type Specs from './types/Specs.ts';
import type StaticData from './types/StaticData.ts';
import type {
    Run, Character, AnalyseInput, RioData,
} from '../core/types.ts';

const getDungeonTopRuns = async (
    season: string,
    dungeon: string,
    page = 0,
): Promise<Runs> => {
    const response = await fetch(`https://raider.io/api/v1/mythic-plus/runs?region=world&season=${season}&dungeon=${dungeon}&affixes=all&page=${page.toString()}`);
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

const getSpecTopCharacters = async (
    season: string,
    className: string,
    specName: string,
    page = 0,
): Promise<Specs> => {
    const response = await fetch(`https://raider.io/api/mythic-plus/rankings/specs?season=${season}&region=world&class=${className}&spec=${specName}&page=${page.toString()}`);
    const data = await response.json() as Specs;
    return data;
};

export default async (
    expansion: number,
    season: string,
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
    await mapLimit(dungeonSlugs, 1, async (dungeon: string) => {
        for (let page = 0; page < maxPage; page += 1) {
            console.info(`Fetching ${dungeon} page ${(page + 1).toString()}/${maxPage.toString()}`);

            // eslint-disable-next-line no-await-in-loop
            const data = await retry(
                { times: 3, interval: 1000 },
                async () => getDungeonTopRuns(season, dungeon, page),
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

    const characterMaxPage = maxPage * 5;
    const minCharactersData = await retry(
        { times: 3, interval: 1000 },
        async () => getTopCharacters(season, characterMaxPage - 1),
    );
    const minCharacterScore = minCharactersData.rankings.rankedCharacters.length > 0
        ? minCharactersData.rankings.rankedCharacters[
            minCharactersData.rankings.rankedCharacters.length - 1
        ].score
        : 0;
    const characterScoreThreshold = Math.max(minScore * dungeonCount, minCharacterScore);

    const specsByCharacters = await mapLimit(specializations, 1, async (
        { id, className, specName }: typeof specializations[number],
    ): Promise<AnalyseInput> => {
        const specCharacters: Character[] = [];

        for (let page = 0; page < characterMaxPage; page += 1) {
            console.info(`Fetching ${specName} ${className} page ${(page + 1).toString()}/${characterMaxPage.toString()}`);

            // eslint-disable-next-line no-await-in-loop
            const data = await retry(
                { times: 3, interval: 1000 },
                async () => getSpecTopCharacters(season, className, specName, page),
            );

            const characters = data.rankings.rankedCharacters;

            if (characters.length === 0) {
                break;
            }

            characters.forEach(({ score, runs, character: { path } }) => {
                if (score >= characterScoreThreshold && runs.length >= dungeonCount) {
                    const isAllDungeonsValid = runs.every((run) => run.mythicLevel >= minLevel);

                    if (isAllDungeonsValid) {
                        specCharacters.push({
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

        const scores = specCharacters.map((character) => character.score);
        const max = specCharacters[0];
        const min = specCharacters[specCharacters.length - 1];

        return {
            key: id,
            scores,
            min,
            max,
        };
    });

    const data: RioData = {
        date: new Date().toISOString(),
        characterScoreThreshold,
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    };

    return data;
};
