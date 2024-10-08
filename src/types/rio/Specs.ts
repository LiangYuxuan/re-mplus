export interface Run {
    zoneId: number,
    keystoneRunId: number,
    clearTimeMs: number,
    mythicLevel: number,
    score: number,
    period: number,
    affixes: number[],
    loggedRunId: number,
    numChests: number,
}

export interface Class {
    id: number,
    name: string,
    slug: string,
}

export interface Race {
    id: number,
    name: string,
    slug: string,
    faction: string,
}

export interface Spec {
    id: number,
    name: string,
    slug: string,
    class_id: number,
    role: string,
    is_melee: boolean,
    patch: string,
}

export interface Realm {
    id: number,
    connectedRealmId: number,
    wowRealmId: number,
    wowConnectedRealmId: number,
    name: string,
    altName: null,
    slug: string,
    altSlug: string,
    locale: string,
    isConnected: boolean,
    realmType: string,
}

export interface Region {
    name: string,
    slug: string,
    short_name: string,
}

export interface Stream {
    id: string,
    name: string,
    user_id: string,
    game_id: string,
    type: string,
    title: string,
    community_ids: [],
    viewer_count: number,
    started_at: string,
    language: string,
    thumbnail_url: string,
}

export interface RecruitmentProfile {
    activity_type: string,
    entity_type: string,
    recruitment_profile_id: number,
}

export interface Character {
    id: number,
    persona_id: number,
    name: string,
    class: Class,
    race: Race,
    faction: string,
    level: number,
    spec: Spec,
    path: string,
    realm: Realm,
    region: Region,
    stream?: Stream,
    recruitmentProfiles: RecruitmentProfile[],
    talentLoadoutText: string,
    anonymized?: boolean,
}

export interface Guild {
    id: number,
    name: string,
    faction: string,
    realm: Realm,
    region: Region,
    path: string,
    logo?: string,
    color?: string,
}

export interface PatronLevel {
    level: number,
    name: string,
    slug: string,
}

export default interface Specs {
    rankings: {
        rankedCharacters: {
            rank: number,
            score: number,
            scoreColor: string,
            runs: Run[],
            character: Character,
            guild?: Guild,
            patronLevel?: PatronLevel,
        }[],
    },
    ui: {
        region: string,
        season: string,
        class: string,
        spec: string,
        page: number,
        pageSize: number,
        lastPage: number,
    },
    region: Region,
    realm: null,
}
