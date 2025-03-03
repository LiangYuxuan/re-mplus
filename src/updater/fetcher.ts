import assert from 'node:assert';

import { mapLimit, retry } from 'async';

import seasons from '../data/generated/seasons.json' with { type: 'json' };
import specializations from '../data/generated/specializations.json' with { type: 'json' };

import type Characters from './types/Characters.ts';
import type Runs from './types/Runs.ts';
import type Specs from './types/Specs.ts';
import type {
    Run, Character, AnalyseInput, RioData,
} from '../core/types.ts';

const getDungeonTopRuns = async (
    season: string,
    dungeon: string,
    page = 0,
): Promise<Runs> => {
    const response = await fetch(`https://raider.io/api/mythic-plus/rankings/runs?region=world&season=${season}&dungeon=${dungeon}&strict=true&page=${page.toString()}&limit=0&minMythicLevel=0&maxMythicLevel=0&eventId=0&faction=&realm=&period=0&recent=false`);
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
    maxPage: number,
    season: keyof typeof seasons,
    dungeonMinLevel: number,
    characterMinScore: number,
    skipCharacterBest: boolean,
    usingSpecIDs: number[],
): Promise<RioData> => {
    const seasonData = seasons[season];

    const dungeonCount = seasonData.dungeons.length;
    const dungeonSlugs = seasonData.dungeons.map((d) => d.slug);
    const dungeonMapIDs = seasonData.dungeons.map((d) => d.challengeMapID);

    const rioID2MapID = new Map<number, number>(
        seasonData.dungeons.map((d) => [d.rioID, d.challengeMapID] as const),
    );

    const usingSpecs = specializations.filter(({ id }) => usingSpecIDs.includes(id));
    const characterUsingSpecs = skipCharacterBest ? [] : usingSpecs;

    const topRuns: Run[] = [];
    await mapLimit(dungeonSlugs, 1, async (dungeon: string) => {
        for (let page = 0; page < maxPage; page += 1) {
            console.info(`Fetching ${dungeon} page ${(page + 1).toString()}/${maxPage.toString()}`);

            // eslint-disable-next-line no-await-in-loop
            const data = await retry(
                { times: 3, interval: 1000 },
                async () => getDungeonTopRuns(season, dungeon, page),
            );

            const runs = data.rankings.rankedGroups;

            if (runs.length === 0) {
                break;
            }

            runs.forEach(({ score, run }) => {
                const id = run.keystone_run_id;
                const level = run.mythic_level;
                const challengeMapID = run.dungeon.map_challenge_mode_id;
                const specs = run.roster.map(({ character }) => character.spec.id);

                if (level >= dungeonMinLevel) {
                    topRuns.push({
                        type: 'run',
                        id,
                        challengeMapID,
                        level,
                        score,
                        specs,
                    });
                }
            });

            if (runs[runs.length - 1].run.mythic_level < dungeonMinLevel) {
                break;
            }
        }
    });

    const dungeonsByRuns: AnalyseInput[] = dungeonMapIDs.map((key) => {
        const runs = topRuns
            .filter((run) => run.challengeMapID === key)
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

    const specsByRuns: AnalyseInput[] = usingSpecs.map(({ id }) => {
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
    const lastCharactersData = await retry(
        { times: 3, interval: 1000 },
        async () => getTopCharacters(season, characterMaxPage - 1),
    );
    const lastCharacterScore = lastCharactersData.rankings.rankedCharacters.length > 0
        ? lastCharactersData.rankings.rankedCharacters[
            lastCharactersData.rankings.rankedCharacters.length - 1
        ].score
        : 0;
    const characterScoreThreshold = Math.max(characterMinScore, lastCharacterScore);

    const recordedRuns = new Set<number>();
    const topCharacterRuns: Run[] = [];
    const specsByCharacters = await mapLimit(characterUsingSpecs, 1, async (
        { id, className, specName }: typeof usingSpecs[number],
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
                    specCharacters.push({
                        type: 'character',
                        path: path.replace(/^\/characters\//, ''),
                        score,
                        spec: id,
                    });

                    runs.forEach((run) => {
                        if (!recordedRuns.has(run.keystoneRunId)) {
                            const challengeMapID = rioID2MapID.get(run.zoneId);

                            assert(challengeMapID !== undefined, `Failed to get challengeMapID for ${run.zoneId.toString()}`);

                            topCharacterRuns.push({
                                type: 'run',
                                id: run.keystoneRunId,
                                challengeMapID,
                                level: run.mythicLevel,
                                score: run.score,
                                specs: [],
                            });

                            recordedRuns.add(run.keystoneRunId);
                        }
                    });
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

    const dungeonsByCharacters: AnalyseInput[] = dungeonMapIDs.map((key) => {
        const runs = topCharacterRuns
            .filter((run) => run.challengeMapID === key)
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

    const dungeonMinLevels = dungeonsByRuns
        .map((d) => (d.min?.type === 'run' ? d.min.level : undefined))
        .filter((level) => level !== undefined);

    const data: RioData = {
        date: new Date().toISOString(),
        statistics: {
            dungeonMinLevel: dungeonMinLevels.length === 0 ? 0 : Math.min(...dungeonMinLevels),
            characterMinScore: characterScoreThreshold,
        },
        dungeonsByRuns,
        specsByRuns,
        dungeonsByCharacters,
        specsByCharacters,
    };

    return data;
};
