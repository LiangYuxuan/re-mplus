import ckmeans from './ckmeans.ts';
import tInterval from './tInterval.ts';

import type { AnalyseInput, AnalyseResult } from './types.ts';

const tierNames = [
    'S',
    'A',
    'B',
    'C',
    'D',
    'F',
];

const calculateAverage = (data: number[]) => {
    const mean = data.reduce((acc, value) => acc + value, 0) / data.length;
    return mean;
};

const calculateStandardDeviation = (data: number[]) => {
    const mean = data.reduce((acc, value) => acc + value, 0) / data.length;
    const variance = data.reduce((acc, value) => acc + (value - mean) ** 2, 0) / (data.length - 1);

    return Math.sqrt(variance);
};

export default (data: AnalyseInput[]): AnalyseResult[] => {
    const analyzedData = data.map(({
        key, scores, min, max,
    }): AnalyseResult => {
        if (scores.length < 1) {
            return {
                key,
                n: 0,
                mean: 0,
                sd: 0,
                ci: 0,
                tier: 'F',
                min,
                max,
            };
        }

        if (scores.length < 2) {
            return {
                key,
                n: 1,
                mean: scores[0],
                sd: 0,
                ci: 0,
                tier: 'F',
                min,
                max,
            };
        }

        const sd = calculateStandardDeviation(scores);
        const mean = calculateAverage(scores);
        const lowerBound = -tInterval(scores.length - 1);
        const ci = mean + ((lowerBound * sd) / Math.sqrt(scores.length));

        const res: AnalyseResult = {
            key,
            n: scores.length,
            mean,
            sd,
            ci,
            tier: 'F',
            min,
            max,
        };
        return res;
    }).toSorted((a, b) => a.ci - b.ci);

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
