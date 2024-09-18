export interface RegionsDate {
    us: string,
    eu: string,
    tw: string,
    kr: string,
    cn: string,
}

export interface Dungeon {
    id: number,
    challenge_mode_id: number,
    slug: string,
    name: string,
    short_name: string,
}

export interface Season {
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
