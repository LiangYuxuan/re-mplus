/* eslint-disable @typescript-eslint/naming-convention */

interface Run {
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

interface Class {
    id: number,
    name: string,
    slug: string,
}

interface Race {
    id: number,
    name: string,
    slug: string,
    faction: string,
}

interface Spec {
    id: number,
    name: string,
    slug: string,
    class_id: number,
    role: string,
    is_melee: boolean,
    patch: string,
}

interface Realm {
    id: number,
    connectedRealmId: number,
    wowRealmId: number,
    wowConnectedRealmId: number,
    name: string,
    altName?: string,
    slug: string,
    altSlug: string,
    locale: string,
    isConnected: boolean,
    realmType: string,
}

interface Region {
    name: string,
    slug: string,
    short_name: string,
}

interface Stream {
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

interface RecruitmentProfile {
    activity_type: string,
    entity_type: string,
    recruitment_profile_id: number,
}

interface Character {
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

interface Guild {
    id: number,
    name: string,
    faction: string,
    realm: Realm,
    region: Region,
    path: string,
    logo?: string,
    color?: string,
}

interface PatronLevel {
    level: number,
    name: string,
    slug: string,
}

export default interface Characters {
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
