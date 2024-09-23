export interface Run {
    id: number,
    map: number,
    level: number,
    score: number,
    specs: number[],
}

export interface RunFile {
    date: string,
    runs: Run[],
}

export interface AnalyseResult {
    key: number,
    n: number,
    mean: number,
    sd: number,
    ci: number,
    tier: string,
    maxRun: {
        id: number,
        level: number,
        score: number,
    },
    minRun: {
        id: number,
        level: number,
        score: number,
    },
}

export interface DataFile {
    date: string,
    dungeons: AnalyseResult[],
    specs: AnalyseResult[],
}
