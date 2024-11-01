type Role = 'tank' | 'healer' | 'melee' | 'ranged';

interface Specialization {
    id: number,
    role: Role,
    className: string,
    specName: string,
}

const specializations: Specialization[] = [
    {
        id: 250,
        role: 'tank',
        className: 'death-knight',
        specName: 'blood',
    },
    {
        id: 251,
        role: 'melee',
        className: 'death-knight',
        specName: 'frost',
    },
    {
        id: 252,
        role: 'melee',
        className: 'death-knight',
        specName: 'unholy',
    },
    {
        id: 577,
        role: 'melee',
        className: 'demon-hunter',
        specName: 'havoc',
    },
    {
        id: 581,
        role: 'tank',
        className: 'demon-hunter',
        specName: 'vengeance',
    },
    {
        id: 102,
        role: 'ranged',
        className: 'druid',
        specName: 'balance',
    },
    {
        id: 103,
        role: 'melee',
        className: 'druid',
        specName: 'feral',
    },
    {
        id: 104,
        role: 'tank',
        className: 'druid',
        specName: 'guardian',
    },
    {
        id: 105,
        role: 'healer',
        className: 'druid',
        specName: 'restoration',
    },
    {
        id: 1467,
        role: 'ranged',
        className: 'evoker',
        specName: 'devastation',
    },
    {
        id: 1468,
        role: 'healer',
        className: 'evoker',
        specName: 'preservation',
    },
    {
        id: 1473,
        role: 'ranged',
        className: 'evoker',
        specName: 'augmentation',
    },
    {
        id: 253,
        role: 'ranged',
        className: 'hunter',
        specName: 'beast-mastery',
    },
    {
        id: 254,
        role: 'ranged',
        className: 'hunter',
        specName: 'marksmanship',
    },
    {
        id: 255,
        role: 'melee',
        className: 'hunter',
        specName: 'survival',
    },
    {
        id: 62,
        role: 'ranged',
        className: 'mage',
        specName: 'arcane',
    },
    {
        id: 63,
        role: 'ranged',
        className: 'mage',
        specName: 'fire',
    },
    {
        id: 64,
        role: 'ranged',
        className: 'mage',
        specName: 'frost',
    },
    {
        id: 268,
        role: 'tank',
        className: 'monk',
        specName: 'brewmaster',
    },
    {
        id: 270,
        role: 'healer',
        className: 'monk',
        specName: 'mistweaver',
    },
    {
        id: 269,
        role: 'melee',
        className: 'monk',
        specName: 'windwalker',
    },
    {
        id: 65,
        role: 'healer',
        className: 'paladin',
        specName: 'holy',
    },
    {
        id: 66,
        role: 'tank',
        className: 'paladin',
        specName: 'protection',
    },
    {
        id: 70,
        role: 'melee',
        className: 'paladin',
        specName: 'retribution',
    },
    {
        id: 256,
        role: 'healer',
        className: 'priest',
        specName: 'discipline',
    },
    {
        id: 257,
        role: 'healer',
        className: 'priest',
        specName: 'holy',
    },
    {
        id: 258,
        role: 'ranged',
        className: 'priest',
        specName: 'shadow',
    },
    {
        id: 259,
        role: 'melee',
        className: 'rogue',
        specName: 'assassination',
    },
    {
        id: 260,
        role: 'melee',
        className: 'rogue',
        specName: 'outlaw',
    },
    {
        id: 261,
        role: 'melee',
        className: 'rogue',
        specName: 'subtlety',
    },
    {
        id: 262,
        role: 'ranged',
        className: 'shaman',
        specName: 'elemental',
    },
    {
        id: 263,
        role: 'melee',
        className: 'shaman',
        specName: 'enhancement',
    },
    {
        id: 264,
        role: 'healer',
        className: 'shaman',
        specName: 'restoration',
    },
    {
        id: 265,
        role: 'ranged',
        className: 'warlock',
        specName: 'affliction',
    },
    {
        id: 266,
        role: 'ranged',
        className: 'warlock',
        specName: 'demonology',
    },
    {
        id: 267,
        role: 'ranged',
        className: 'warlock',
        specName: 'destruction',
    },
    {
        id: 71,
        role: 'melee',
        className: 'warrior',
        specName: 'arms',
    },
    {
        id: 72,
        role: 'melee',
        className: 'warrior',
        specName: 'fury',
    },
    {
        id: 73,
        role: 'tank',
        className: 'warrior',
        specName: 'protection',
    },
];
export default specializations;

export type { Specialization };
