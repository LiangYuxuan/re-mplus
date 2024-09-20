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
