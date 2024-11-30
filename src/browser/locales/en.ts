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
        ['dungeon', 'Dungeon'],
        ['tank', 'Tank'],
        ['healer', 'Healer'],
        ['melee', 'Melee'],
        ['ranged', 'Ranged'],
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
} satisfies LocaleData;
