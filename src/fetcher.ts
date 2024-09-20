import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mapLimit } from 'async';

import {
    RIO_MAX_PAGE, RIO_REGIONS, RIO_EXPANSION_ID, RIO_SEASON,
} from './config.ts';

import type { Run, RunFile } from './types.ts';
import type Runs from './types/rio/Runs.ts';
import type StaticData from './types/rio/StaticData.ts';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const cacheFilePath = path.join(root, 'data', 'runs.json');

export default async (force = false): Promise<Run[]> => {
    if (!force) {
        try {
            const text = await fs.readFile(cacheFilePath, 'utf-8');
            const data = JSON.parse(text) as RunFile;

            const date = new Date(data.date);
            const now = new Date();

            if (now.getTime() - date.getTime() < 1000 * 60 * 60) {
                return data.runs;
            }
        } catch (error) {
            // do nothing
        }
    }

    const staticData = await (await fetch(`https://raider.io/api/v1/mythic-plus/static-data?expansion_id=${RIO_EXPANSION_ID.toString()}`)).json() as StaticData;
    const seasonStaticData = staticData.seasons.find((s) => s.slug === RIO_SEASON);
    assert(seasonStaticData, `Season ${RIO_SEASON} not found`);

    const seasonDungeons = seasonStaticData.dungeons.map((d) => d.slug);

    const runs: Run[] = [];
    await mapLimit(RIO_REGIONS, 1, async (region: string) => {
        await mapLimit(seasonDungeons, 1, async (dungeon: string) => {
            for (let page = 0; page < RIO_MAX_PAGE; page += 1) {
                // eslint-disable-next-line no-console
                console.log(`Fetching ${region} ${dungeon} page ${(page + 1).toString()}/${RIO_MAX_PAGE.toString()}`);

                // eslint-disable-next-line no-await-in-loop
                const response = await fetch(`https://raider.io/api/v1/mythic-plus/runs?season=${RIO_SEASON}&region=${region}&dungeon=${dungeon}&affixes=all&page=${page.toString()}`);
                // eslint-disable-next-line no-await-in-loop
                const data = await response.json() as Runs;

                if (data.rankings.length === 0) {
                    break;
                }

                data.rankings.forEach(({ score, run }) => {
                    const id = run.keystone_run_id;
                    const level = run.mythic_level;
                    const map = run.dungeon.map_challenge_mode_id;
                    const specs = run.roster.map(({ character }) => character.spec.id);

                    runs.push({
                        id,
                        map,
                        level,
                        score,
                        specs,
                    });
                });
            }
        });
    });

    await fs.writeFile(cacheFilePath, JSON.stringify({
        date: new Date().toISOString(),
        runs,
    }));

    return runs;
};
