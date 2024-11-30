export interface Run {
    type: 'run',
    id: number,
    mapID: number,
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
    characterScoreThreshold: number,
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
    season: string,
    characterScoreThreshold: number,
    dungeonsByRuns: AnalyseResult[],
    specsByRuns: AnalyseResult[],
    specsByCharacters: AnalyseResult[],
}
