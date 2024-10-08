import ckmeans from './ckmeans.ts';
import tInterval from './tInterval.ts';

import type { AnalyseInput, AnalyseResult } from './types.ts';

const tierNames = ['S', 'A', 'B', 'C', 'D', 'F'];

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
    const allScore = data.flatMap(({ scores }) => scores);
    const allScoreSD = allScore.length >= 2 ? calculateStandardDeviation(allScore) : 1;

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

        const sorted = scores.sort((a, b) => b - a);
        const sd = calculateStandardDeviation(sorted);
        const mean = calculateAverage(sorted);
        const lowerBound = -tInterval[sorted.length - 1];
        const ci = mean + ((lowerBound * allScoreSD) / Math.sqrt(sorted.length));

        const res: AnalyseResult = {
            key,
            n: sorted.length,
            mean,
            sd,
            ci,
            tier: 'F',
            min,
            max,
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
