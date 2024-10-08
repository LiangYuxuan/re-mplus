export interface Dungeon {
    type: string,
    id: number,
    name: string,
    short_name: string,
    slug: string,
    expansion_id: number,
    icon_url: string,
    patch: string,
    wowInstanceId: number,
    map_challenge_mode_id: number,
    keystone_timer_ms: number,
    num_bosses: number,
    group_finder_activity_ids: number[],
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
}

export interface Video {
    id: number,
    seasonSlug: string,
    createdByUserId: number,
    videoType: string,
    videoId: string,
    startVideoTimeSeconds: null,
    duration: number,
    character: Character,
}

export interface WeeklyModifier {
    id: number,
    icon: string,
    name: string,
    slug: string,
    description: string,
}

export interface Roster {
    character: Character,
    oldCharacter?: Character,
    isTransfer: boolean,
    role: string,
}

export interface Run {
    keystone_team_id: number,
    season: string,
    status: string,
    dungeon: Dungeon,
    keystone_run_id: number,
    mythic_level: number,
    clear_time_ms: number,
    keystone_time_ms: number,
    completed_at: string,
    num_chests: number,
    time_remaining_ms: number,
    logged_run_id?: number,
    videos: Video[],
    weekly_modifiers: WeeklyModifier[],
    num_modifiers_active: number,
    faction: string,
    deleted_at: null,
    keystone_platoon_id: null,
    platoon: null,
    roster: Roster[],
}

export default interface Runs {
    rankings: {
        rank: number,
        score: number,
        run: Run,
    }[],
    leaderboard_url: string,
    params: {
        season: string,
        region: string,
        dungeon: string,
        affixes: string,
        page: number,
    }
}
