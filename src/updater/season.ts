import seasons from '../data/generated/seasons.json' with { type: 'json' };

interface BlizzardScoreRule {
    type: 'blizzard',
    baseScores: number[],
    levelScore: number,
    timeModifier: number,
    depletionPunishment: number,
    depletionMaxLevel: number,
    allWeeksMultiplier: number,
}

interface SeasonEntry {
    prefix: string,
    rule: BlizzardScoreRule,
    maxRewardLevel: number,
    ignoreSpecs: number[],
}

const tww1: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        165,
        180,
        205,
        220,
        235,
        265,
        280,
        295,
        320,
        335,
        365,
    ],
    levelScore: 15,
    timeModifier: 15,
    depletionPunishment: 15,
    depletionMaxLevel: 10,
    allWeeksMultiplier: 1,
};

const df4: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        94,
        101,
        108,
        125,
        132,
        139,
        146,
        153,
        170,
    ],
    levelScore: 7,
    timeModifier: 5,
    depletionPunishment: 5,
    depletionMaxLevel: 10,
    allWeeksMultiplier: 2,
};

const df2: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        40,
        45,
        50,
        55,
        60,
        75,
        80,
        85,
        90,
        97,
        104,
        111,
        128,
    ],
    levelScore: 7,
    timeModifier: 5,
    depletionPunishment: 5,
    depletionMaxLevel: 20,
    allWeeksMultiplier: 2,
};

const df1: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        40,
        45,
        55,
        60,
        65,
        75,
        80,
        85,
        100,
    ],
    levelScore: 7,
    timeModifier: 5,
    depletionPunishment: 5,
    depletionMaxLevel: 20,
    allWeeksMultiplier: 2,
};

const sl2: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        40,
        45,
        55,
        60,
        65,
        75,
        80,
        85,
        100,
    ],
    levelScore: 5,
    timeModifier: 5,
    depletionPunishment: 5,
    depletionMaxLevel: Infinity,
    allWeeksMultiplier: 2,
};

const rio: BlizzardScoreRule = {
    type: 'blizzard',
    baseScores: [
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100,
        110,
        121,
        133,
        146,
        161,
        177,
        195,
        214,
        236,
        259,
        285,
        314,
        345,
        380,
        418,
        459,
        505,
        556,
        612,
        673,
    ],
    levelScore: 0,
    timeModifier: 0,
    depletionPunishment: 0,
    depletionMaxLevel: 0,
    allWeeksMultiplier: 1,
};

const seasonRules: SeasonEntry[] = [
    {
        prefix: 'season-tww-1',
        rule: tww1,
        maxRewardLevel: 10,
        ignoreSpecs: [],
    },
    {
        prefix: 'season-df-4',
        rule: df4,
        maxRewardLevel: 10,
        ignoreSpecs: [],
    },
    {
        prefix: 'season-df-3',
        rule: df2,
        maxRewardLevel: 20,
        ignoreSpecs: [],
    },
    {
        prefix: 'season-df-2',
        rule: df2,
        maxRewardLevel: 20,
        ignoreSpecs: [],
    },
    {
        prefix: 'season-df-1',
        rule: df1,
        maxRewardLevel: 20,
        ignoreSpecs: [
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-sl-4',
        rule: sl2,
        maxRewardLevel: 15,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-sl-3',
        rule: sl2,
        maxRewardLevel: 15,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-sl-2',
        rule: sl2,
        maxRewardLevel: 15,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-sl-1',
        rule: rio,
        maxRewardLevel: 15,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-bfa-4',
        rule: rio,
        maxRewardLevel: 15,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-bfa-3',
        rule: rio,
        maxRewardLevel: 10,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-bfa-2',
        rule: rio,
        maxRewardLevel: 10,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
    {
        prefix: 'season-bfa-1',
        rule: rio,
        maxRewardLevel: 10,
        ignoreSpecs: [
            1467, // Devastation Evoker
            1468, // Preservation Evoker
            1473, // Augmentation Evoker
        ],
    },
];

const getSeasonInfo = (
    slug: keyof typeof seasons,
    overrideLevel = 0,
) => {
    const entry = seasonRules.find((e) => slug.startsWith(e.prefix));
    if (!entry) {
        return {
            level: overrideLevel,
            score: 250, // Keystone Master
            ignoreSpecs: [],
        };
    }

    const { rule, maxRewardLevel, ignoreSpecs } = entry;
    const { baseScores, levelScore, allWeeksMultiplier } = rule;
    const providedLevel = baseScores.length + 1;

    const level = overrideLevel > 0 ? overrideLevel : maxRewardLevel;

    const score = baseScores[Math.min(level, providedLevel) - 2]
        + Math.max(0, level - providedLevel) * levelScore;

    return {
        level,
        score: score * allWeeksMultiplier,
        ignoreSpecs,
    };
};

export default getSeasonInfo;
