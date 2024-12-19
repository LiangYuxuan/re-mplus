export interface Run {
    type: 'run',
    id: number,
    challengeMapID: number,
    level: number,
    score: number,
    specs: number[],
}

export interface Character {
    type: 'character',
    path: string,
    score: number,
    spec: number,
}

export interface AnalyseInput {
    key: number,
    scores: number[],
    min?: Run | Character,
    max?: Run | Character,
}

export interface RioData {
    date: string,
    dungeonMinLevel: {
        min: number,
        max: number,
    },
    characterMinScore: number,
    dungeonsByRuns: AnalyseInput[],
    specsByRuns: AnalyseInput[],
    specsByCharacters: AnalyseInput[],
}

export interface AnalyseResult {
    key: number,
    n: number,
    mean: number,
    sd: number,
    ci: number,
    tier: string,
    min?: Run | Character,
    max?: Run | Character,
}

export interface AnalyseDataFile {
    date: string,
    config: {
        maxPage: number,
        season: string,
        runMinLevel: number,
        runMinScore: number,
        allWeeksMultiplier: number,
        ignoreSpecs: number[],
    },
    dungeonMinLevel: {
        min: number,
        max: number,
    },
    characterMinScore: number,
    dungeonsByRuns: AnalyseResult[],
    specsByRuns: AnalyseResult[],
    specsByCharacters: AnalyseResult[],
}
