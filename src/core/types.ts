export interface BasicRun {
    id: number,
    level: number,
    score: number,
}

export interface AnalyseInput {
    key: number,
    scores: number[],
    min?: BasicRun,
    max?: BasicRun,
}

export interface RioData {
    date: string,
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
    max?: BasicRun,
    min?: BasicRun,
}

export interface AnalyseDataFile {
    date: string,
    season: string,
    dungeonsByRuns: AnalyseResult[],
    specsByRuns: AnalyseResult[],
    specsByCharacters: AnalyseResult[],
}
