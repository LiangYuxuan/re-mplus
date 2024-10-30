/* eslint-disable @typescript-eslint/naming-convention */

interface RegionsDate {
    us: string,
    eu: string,
    tw: string,
    kr: string,
    cn: string,
}

interface Dungeon {
    id: number,
    challenge_mode_id: number,
    slug: string,
    name: string,
    short_name: string,
}

interface Season {
    slug: string,
    name: string,
    short_name: string,
    seasonal_affix: null,
    starts: RegionsDate,
    ends: RegionsDate,
    dungeons: Dungeon[],
}

export default interface StaticData {
    seasons: Season[],
    dungeons: Dungeon[],
}
