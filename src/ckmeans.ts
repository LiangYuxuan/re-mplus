/* eslint-disable no-param-reassign */

const createMatrix = (nRows: number, nCols: number): number[][] => {
    const matrix = [];
    for (let i = 0; i < nRows; i += 1) {
        const row = [];
        for (let j = 0; j < nCols; j += 1) {
            row.push(0);
        }
        matrix.push(row);
    }
    return matrix;
};

const ssq = (j: number, i: number, sumX: number[], sumXSQ: number[]) => {
    if (j > 0) {
        const muji = (sumX[i] - sumX[j - 1]) / (i - j + 1); // mu(j, i)
        const sji = sumXSQ[i] - sumXSQ[j - 1] - (i - j + 1) * muji * muji; // s(j, i)
        return sji > 0 ? sji : 0;
    }

    const sji = sumXSQ[i] - (sumX[i] * sumX[i]) / (i + 1); // s(j, i)
    return sji > 0 ? sji : 0;
};

const fillMatrixColumn = (
    iMin: number,
    iMax: number,
    k: number,
    S: number[][],
    J: number[][],
    sumX: number[],
    sumXSQ: number[],
    n: number,
) => {
    if (iMin > iMax) {
        return;
    }

    const i = Math.floor((iMin + iMax) / 2);
    S[k][i] = S[k - 1][i - 1];
    J[k][i] = i;

    let jLow = Math.max(k, iMin > k ? J[k][iMin - 1] : J[k - 1][i]);
    const jHigh = Math.min(i - 1, iMax < n - 1 ? J[k][iMax + 1] : i - 1);

    for (let j = jHigh; j >= jLow; j -= 1) {
        const sji = ssq(j, i, sumX, sumXSQ);
        if (sji + S[k - 1][jLow - 1] >= S[k][i]) {
            break;
        }

        const sjLowi = ssq(jLow, i, sumX, sumXSQ); // s(jLow, i)
        const ssqjLow = sjLowi + S[k - 1][jLow - 1];
        if (ssqjLow < S[k][i]) {
            S[k][i] = ssqjLow;
            J[k][i] = jLow;
        }

        jLow += 1;

        const ssqj = sji + S[k - 1][j - 1];
        if (ssqj < S[k][i]) {
            S[k][i] = ssqj;
            J[k][i] = j;
        }
    }

    fillMatrixColumn(iMin, i - 1, k, S, J, sumX, sumXSQ, n);
    fillMatrixColumn(i + 1, iMax, k, S, J, sumX, sumXSQ, n);
};

const fillDPMatrix = (
    data: number[],
    S: number[][],
    J: number[][],
    nClusters: number,
    n: number,
) => {
    const sumX: number[] = [];
    const sumXSQ: number[] = [];

    const shift = data[Math.floor(n / 2)];

    for (let i = 0; i < n; i += 1) {
        const offset = data[i] - shift;

        sumX.push((i === 0 ? 0 : sumX[i - 1]) + offset);
        sumXSQ.push((i === 0 ? 0 : sumXSQ[i - 1]) + offset ** 2);

        S[0][i] = ssq(0, i, sumX, sumXSQ);
        J[0][i] = 0;
    }

    for (let k = 1; k < nClusters; k += 1) {
        const iMin = k < nClusters - 1 ? k : n - 1;
        fillMatrixColumn(iMin, n - 1, k, S, J, sumX, sumXSQ, n);
    }
};

export default (sorted: number[], nClusters: number) => {
    // const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    const S = createMatrix(nClusters, n);
    const J = createMatrix(nClusters, n);

    fillDPMatrix(sorted, S, J, nClusters, n);

    const clusters = [];
    let clusterRight = n - 1;
    for (let cluster = nClusters - 1; cluster >= 0; cluster -= 1) {
        const clusterLeft = J[cluster][clusterRight];
        clusters[cluster] = clusterLeft;

        if (cluster > 0) {
            clusterRight = clusterLeft - 1;
        }
    }

    return clusters;
};
