import ckmeans from './ckmeans.ts';
import tInterval from './tInterval.ts';

import type { Run } from './types.ts';

const tierNames = ['S', 'A', 'B', 'C', 'D', 'F'];

interface AnalyseResult {
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

const calculateAverage = (data: number[]) => {
    const mean = data.reduce((acc, value) => acc + value, 0) / data.length;
    return mean;
};

const calculateStandardDeviation = (data: number[]) => {
    const mean = data.reduce((acc, value) => acc + value, 0) / data.length;
    const variance = data.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (data.length - 1);

    return Math.sqrt(variance);
};

export default (data: Map<number, Run[]>, limit = 500): AnalyseResult[] => {
    const allScore = [...data.values()].flat().map(({ score }) => score);
    const allScoreSD = allScore.length >= 2 ? calculateStandardDeviation(allScore) : 1;

    const analyzedData = [...data.entries()].map(([key, runs]) => {
        if (runs.length < 1) {
            const res: AnalyseResult = {
                key,
                n: 0,
                mean: 0,
                sd: 0,
                ci: 0,
                tier: 'F',
                maxRun: {
                    id: 0,
                    level: 0,
                    score: 0,
                },
                minRun: {
                    id: 0,
                    level: 0,
                    score: 0,
                },
            };
            return res;
        }

        if (runs.length < 2) {
            const res: AnalyseResult = {
                key,
                n: 1,
                mean: runs[0].score,
                sd: 0,
                ci: 0,
                tier: 'F',
                maxRun: {
                    id: runs[0].id,
                    level: runs[0].level,
                    score: runs[0].score,
                },
                minRun: {
                    id: runs[0].id,
                    level: runs[0].level,
                    score: runs[0].score,
                },
            };
            return res;
        }

        const sortedRuns = [...runs].sort((a, b) => b.score - a.score);

        const maxRun = sortedRuns[0];
        const minRun = sortedRuns[Math.min(sortedRuns.length, limit) - 1];
        const limited = sortedRuns.slice(0, limit).map(({ score }) => score);

        const sd = calculateStandardDeviation(limited);
        const mean = calculateAverage(limited);
        const lowerBound = -tInterval[limited.length - 1];
        const ci = mean + ((lowerBound * allScoreSD) / Math.sqrt(limited.length));

        const res: AnalyseResult = {
            key,
            n: limited.length,
            mean,
            sd,
            ci,
            tier: 'F',
            maxRun: {
                id: maxRun.id,
                level: maxRun.level,
                score: maxRun.score,
            },
            minRun: {
                id: minRun.id,
                level: minRun.level,
                score: minRun.score,
            },
        };
        return res;
    }).sort((a, b) => a.ci - b.ci);

    const buckets = ckmeans(analyzedData.map((r) => r.ci), 6).reverse();
    const result = analyzedData.map((entry, index) => {
        const bucketIndex = buckets.findIndex((bucket) => bucket <= index);
        const tier = tierNames[bucketIndex];

        return {
            ...entry,
            tier,
        };
    }).reverse();

    return result;
};
