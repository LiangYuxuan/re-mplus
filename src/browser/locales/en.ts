import dungeons from '../../data/generated/dungeons.json' with { type: 'json' };
import specializations from '../../data/generated/specializations.json' with { type: 'json' };

import type { LocaleData } from './type.ts';

export default {
    language: 'en',
    strings: new Map([
        ['title', 'Mythic Plus Tier List'],
        ['based-on-dungeon-best-run', 'Based on Dungeon Best Run'],
        ['based-on-character-best-record', 'Based on Character Best Record'],
        ['button-refresh', 'Refresh'],
        ['button-switch', 'Switch Data Source'],
        ['button-toggle-description', 'Toggle Description Text'],
        ['button-toggle-details', 'Toggle Detailed Data'],
        ['button-toggle-emoji', 'Toggle Emoji'],
        ['current-season', 'Current Season'],
        ['missing-character-best-record', 'Due to Raider.IO is not providing Spec Leaderboard data, Character Best Record is not available.'],
        ['dungeon', 'Dungeon'],
        ['tank', 'Tank'],
        ['healer', 'Healer'],
        ['melee', 'Melee'],
        ['ranged', 'Ranged'],
        ['expansion', 'Expansion'],
        ['season', 'Season'],
        ['config-max-page', 'Config Max Page'],
        ['config-min-level', 'Config Min Level'],
        ['config-min-score', 'Config Min Score'],
        ['dungeon-min-level', 'Dungeon Min Level'],
        ['character-min-score', 'Character Min Score'],
        ['name', 'Name'],
        ['tier', 'Tier'],
        ['n', 'N'],
        ['min', 'Min'],
        ['max', 'Max'],
        ['mean', 'mean'],
        ['sd', 'sd'],
        ['ci', 'ci'],
    ]),
    specializationsShortName: new Map(
        specializations.map(({ id, en }) => [id, en.substring(0, 4)] as const),
    ),
    dungeonsShortName: new Map(
        dungeons
            .map(({ id, en, shortName }) => {
                if (shortName !== undefined) {
                    return [id, shortName] as const;
                }
                return [id, en] as const;
            }),
    ),
    specializations: new Map(specializations.map(({ id, en }) => [id, en] as const)),
    dungeons: new Map(dungeons.map(({ id, en }) => [id, en] as const)),
    seasons: new Map([
        ['season-tww-1', 'The War Within Season 1'],
        ['season-df-4-cutoffs', 'Dragonflight Season 4'],
        ['season-df-3', 'Dragonflight Season 3'],
        ['season-df-2', 'Dragonflight Season 2'],
        ['season-df-1', 'Dragonflight Season 1'],
        ['season-sl-4', 'Shadowlands Season 4'],
        ['season-sl-3', 'Shadowlands Season 3'],
        ['season-sl-2', 'Shadowlands Season 2'],
        ['season-sl-1', 'Shadowlands Season 1'],
        ['season-bfa-4', 'Battle for Azeroth Season 4'],
        ['season-bfa-3', 'Battle for Azeroth Season 3'],
        ['season-bfa-2', 'Battle for Azeroth Season 2'],
        ['season-bfa-1', 'Battle for Azeroth Season 1'],
    ]),
} satisfies LocaleData;
