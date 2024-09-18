import assert from 'node:assert';
import fs from 'node:fs/promises';

import { mapLimit, timesLimit } from 'async';

import type Runs from './types/rio/Runs.ts';
import type StaticData from './types/rio/StaticData.ts';

interface Run {
    map: string,
    score: number,
    specs: string[],
}

const expansionID = 10; // TWW
const season = 'season-tww-1';

const maxPage = 25;
const regions = ['us', 'eu', 'kr', 'tw', 'cn'];

const staticData = await (await fetch(`https://raider.io/api/v1/mythic-plus/static-data?expansion_id=${expansionID.toString()}`)).json() as StaticData;

const seasonStaticData = staticData.seasons.find((s) => s.slug === season);
assert(seasonStaticData, `Season ${season} not found`);

const seasonDungeons = seasonStaticData.dungeons.map((d) => d.slug);

const runs: Run[] = [];

await mapLimit(regions, 1, async (region: string) => {
    await mapLimit(seasonDungeons, 1, async (dungeon: string) => {
        await timesLimit(maxPage, 1, async (page: number) => {
            const response = await fetch(`https://raider.io/api/v1/mythic-plus/runs?season=${season}&region=${region}&dungeon=${dungeon}&affixes=all&page=${page.toString()}`);
            const data = await response.json() as Runs;

            data.rankings.forEach(({ score, run }) => {
                const map = run.dungeon.name;
                const specs = run.roster.map(({ character }) => {
                    const specName = character.spec.name;
                    const className = character.class.name;

                    return `${specName} ${className}`;
                });

                runs.push({ map, score, specs });
            });
        });
    });
});

await fs.writeFile('runs.json', JSON.stringify(runs, null, 4));
