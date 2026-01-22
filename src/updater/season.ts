import assert from 'node:assert';

import seasons from '../data/generated/seasons.json' with { type: 'json' };
import specializations from '../data/generated/specializations.json' with { type: 'json' };
import { getMythicPlusStaticData } from '../data/rio.ts';

interface SeasonInfo {
    dungeonMinLevel: number,
    characterMinScore: number,
    skipCharacterBest: boolean,
    usingSpecIDs: number[],
    includePostSeason: boolean,
}

interface SeasonAdditionData {
    prefix: string,
    seasonEndsDate: Date,
    maxRewardLevel: number,
    maxRewardScore: number,
    skipCharacterBest?: boolean,
}

interface SpecializationIntroduceData {
    id: number,
    prefix: string,
    addition: string[],
}

const seasonsAddition: SeasonAdditionData[] = [
    {
        prefix: 'season-tww-3',
        seasonEndsDate: new Date('2026-01-20T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-tww-2',
        seasonEndsDate: new Date('2025-08-05T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-tww-1',
        seasonEndsDate: new Date('2025-02-25T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-df-4',
        seasonEndsDate: new Date('2024-07-23T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-df-3',
        seasonEndsDate: new Date('2024-04-23T15:00:00Z'),
        maxRewardLevel: 20,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-df-2',
        seasonEndsDate: new Date('2023-11-07T15:00:00Z'),
        maxRewardLevel: 20,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-df-1',
        seasonEndsDate: new Date('2023-05-02T15:00:00Z'),
        maxRewardLevel: 20,
        maxRewardScore: 2500,
    },
    {
        prefix: 'season-sl-4',
        seasonEndsDate: new Date('2022-10-25T15:00:00Z'),
        maxRewardLevel: 15,
        maxRewardScore: 2000,
    },
    {
        prefix: 'season-sl-3',
        seasonEndsDate: new Date('2022-08-02T15:00:00Z'),
        maxRewardLevel: 15,
        maxRewardScore: 3000,
    },
    {
        prefix: 'season-sl-2',
        seasonEndsDate: new Date('2022-02-22T15:00:00Z'),
        maxRewardLevel: 15,
        maxRewardScore: 2000,
    },
    {
        prefix: 'season-sl-1',
        seasonEndsDate: new Date('2021-06-29T15:00:00Z'),
        maxRewardLevel: 15,
        maxRewardScore: 1288, // Keystone Master 15 -> 161, 161 * 8 = 1288
    },
    {
        prefix: 'season-bfa-4',
        seasonEndsDate: new Date('2020-10-13T15:00:00Z'),
        maxRewardLevel: 15,
        maxRewardScore: 1932, // Keystone Master 15 -> 161, 161 * 12 = 1932
    },
    {
        prefix: 'season-bfa-3',
        seasonEndsDate: new Date('2020-01-14T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 1000, // Keystone Master 10 -> 100, 100 * 10 = 1000
    },
    {
        prefix: 'season-bfa-2',
        seasonEndsDate: new Date('2019-06-25T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 0,
        skipCharacterBest: true,
    },
    {
        prefix: 'season-bfa-1',
        seasonEndsDate: new Date('2019-01-22T15:00:00Z'),
        maxRewardLevel: 10,
        maxRewardScore: 0,
        skipCharacterBest: true,
    },
];

const specializationsIntroduce: SpecializationIntroduceData[] = [
    {
        id: 1480, // Devourer Demon Hunter
        prefix: 'season-mn-1',
        addition: [
            'season-tww-3',
        ],
    },
    {
        id: 1473, // Augmentation Evoker
        prefix: 'season-df-2',
        addition: [],
    },
    {
        id: 1468, // Preservation Evoker
        prefix: 'season-df-1',
        addition: [
            'season-sl-4-post',
            'season-sl-4-patch-10-0',
        ],
    },
    {
        id: 1467, // Devastation Evoker
        prefix: 'season-df-1',
        addition: [
            'season-sl-4-post',
            'season-sl-4-patch-10-0',
        ],
    },
];

const getSeasonInfo = async (slug: keyof typeof seasons): Promise<SeasonInfo> => {
    const entry = seasonsAddition.find((e) => slug.startsWith(e.prefix));
    if (!entry) {
        return {
            dungeonMinLevel: 0,
            characterMinScore: 0,
            skipCharacterBest: false,
            usingSpecIDs: specializations.map(({ id }) => id),
            includePostSeason: false,
        };
    }

    const seasonData = seasons[slug];
    const staticData = await getMythicPlusStaticData(seasonData.expansion);
    const seasonStaticData = staticData.seasons.find((s) => s.slug === slug);
    assert(seasonStaticData, `Season ${slug} not found in static data`);

    const entryIndex = seasonsAddition.findIndex((e) => slug.startsWith(e.prefix));
    const ignoreSpecIDs = specializationsIntroduce
        .filter(({ prefix, addition }) => {
            if (addition.includes(slug)) {
                return false;
            }

            const index = seasonsAddition.findIndex((e) => prefix === e.prefix);
            return index < entryIndex;
        })
        .map(({ id }) => id);

    return {
        dungeonMinLevel: entry.maxRewardLevel,
        characterMinScore: entry.maxRewardScore,
        skipCharacterBest: entry.skipCharacterBest === true,
        usingSpecIDs: specializations
            .filter(({ id }) => !ignoreSpecIDs.includes(id))
            .map(({ id }) => id),
        includePostSeason: seasonStaticData.ends.us !== undefined
            ? new Date(seasonStaticData.ends.us) > entry.seasonEndsDate
            : false,
    };
};

export default getSeasonInfo;
