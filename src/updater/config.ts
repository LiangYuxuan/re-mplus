import seasons from '../data/generated/seasons.json' with { type: 'json' };

export const RIO_MAX_PAGE = 250;

export const RIO_CURRENT_SEASON: keyof typeof seasons = 'season-tww-2';

export const RIO_CURRENT_SEASON_MIN_LEVEL = 7;

export const RIO_CURRENT_SEASON_MIN_PER_DUNGEON_SCORE = 250;
