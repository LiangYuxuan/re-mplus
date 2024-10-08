import fs from 'node:fs/promises';
import path from 'node:path';

import analyse from '../analyse.ts';
import fetcher from '../fetcher.ts';

import type { AnalyseDataFile } from '../types.ts';

const outputFilePath = path.resolve(process.argv[2]);

fetcher()
    .then(({
        date,
        dungeonsByRuns,
        specsByRuns,
        specsByCharacters,
    }) => {
        const data: AnalyseDataFile = {
            date,
            dungeonsByRuns: analyse(dungeonsByRuns),
            specsByRuns: analyse(specsByRuns),
            specsByCharacters: analyse(specsByCharacters),
        };
        const dataText = JSON.stringify(data);

        return fs.writeFile(outputFilePath, dataText);
    })
    .then()
    .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    });
