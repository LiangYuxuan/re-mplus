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
    statistics: {
        dungeonMinLevel: number,
        characterMinScore: number,
    },
    dungeonsByRuns: AnalyseInput[],
    specsByRuns: AnalyseInput[],
    dungeonsByCharacters: AnalyseInput[],
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
        dungeonMinLevel: number,
        characterMinScore: number,
        skipCharacterBest: boolean,
    },
    statistics: {
        dungeonMinLevel: number,
        characterMinScore: number,
        includePostSeason: boolean,
    },
    dungeonsByRuns: AnalyseResult[],
    specsByRuns: AnalyseResult[],
    dungeonsByCharacters: AnalyseResult[],
    specsByCharacters: AnalyseResult[],
}
