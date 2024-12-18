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
    runMinLevel: number,
    runMinScore: number,
): Promise<RioData> => {
    const seasonData = seasons[season];

    const dungeonCount = seasonData.dungeons.length;
    const dungeonSlugs = seasonData.dungeons.map((d) => d.slug);
    const dungeonMapIDs = seasonData.dungeons.map((d) => d.challengeMapID);

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

                if (level >= runMinLevel) {
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

            if (runs[runs.length - 1].run.mythic_level < runMinLevel) {
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
    const lastCharactersData = await retry(
        { times: 3, interval: 1000 },
        async () => getTopCharacters(season, characterMaxPage - 1),
    );
    const lastCharacterScore = lastCharactersData.rankings.rankedCharacters.length > 0
        ? lastCharactersData.rankings.rankedCharacters[
            lastCharactersData.rankings.rankedCharacters.length - 1
        ].score
        : 0;
    const characterMinScore = Math.max(runMinScore * dungeonCount, lastCharacterScore);

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
                if (score >= characterMinScore && runs.length >= dungeonCount) {
                    const isAllDungeonsValid = runs.every((run) => run.mythicLevel >= runMinLevel
                        && run.score >= runMinScore);

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

            if (characters[characters.length - 1].score < characterMinScore) {
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

    const dungeonMinLevels = dungeonsByRuns
        .map((d) => (d.min?.type === 'run' ? d.min.level : undefined))
        .filter((level) => level !== undefined);

    const data: RioData = {
        date: new Date().toISOString(),
        dungeonMinLevel: {
            min: dungeonMinLevels.length === 0 ? 0 : Math.min(...dungeonMinLevels),
            max: dungeonMinLevels.length === 0 ? 0 : Math.max(...dungeonMinLevels),
        },
        characterMinScore,
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    };

    return data;
};
