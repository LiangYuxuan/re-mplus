// https://en.wikipedia.org/wiki/Student%27s_t-distribution#Table_of_selected_values

const infiniteSizeValue = 1.960;

const data = [
    { size: 120, value: 1.980 },
    { size: 100, value: 1.984 },
    { size: 80, value: 1.990 },
    { size: 60, value: 2.000 },
    { size: 50, value: 2.009 },
    { size: 40, value: 2.021 },
    { size: 30, value: 2.042 },
    { size: 29, value: 2.045 },
    { size: 28, value: 2.048 },
    { size: 27, value: 2.052 },
    { size: 26, value: 2.056 },
    { size: 25, value: 2.060 },
    { size: 24, value: 2.064 },
    { size: 23, value: 2.069 },
    { size: 22, value: 2.074 },
    { size: 21, value: 2.080 },
    { size: 20, value: 2.086 },
    { size: 19, value: 2.093 },
    { size: 18, value: 2.101 },
    { size: 17, value: 2.110 },
    { size: 16, value: 2.120 },
    { size: 15, value: 2.131 },
    { size: 14, value: 2.145 },
    { size: 13, value: 2.160 },
    { size: 12, value: 2.179 },
    { size: 11, value: 2.201 },
    { size: 10, value: 2.228 },
    { size: 9, value: 2.262 },
    { size: 8, value: 2.306 },
    { size: 7, value: 2.365 },
    { size: 6, value: 2.447 },
    { size: 5, value: 2.571 },
    { size: 4, value: 2.776 },
    { size: 3, value: 3.182 },
    { size: 2, value: 4.303 },
    { size: 1, value: 12.706 },
];

export default (size: number): number => {
    if (size > data[0].size) {
        return infiniteSizeValue;
    }

    for (const item of data) {
        if (size >= item.size) {
            return item.value;
        }
    }

    throw new Error('Invalid size');
};
