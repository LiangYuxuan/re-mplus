/* eslint-disable import-x/no-unused-modules */

import specializations from '../data/generated/specializations.json' with { type: 'json' };

import {
    selectLanguage,
    getLocaleString,
    getDungeonShortName,
    getSpecializationShortName,
    getDungeonName,
    gettSpecializationName,
    getSeasonName,
} from './locales/index.ts';

import type { AnalyseResult, AnalyseDataFile } from '../core/types.ts';

interface ButtonData {
    getTitle: () => string,
    isRefresh?: boolean,
    isActive: () => boolean,
    onClick?: () => void,
}

interface ConfigDisplay {
    name: string,
    value: string,
}

interface SelectorData {
    label: () => string,
    select: (data: AnalyseDataFile) => {
        dungeons: AnalyseResult[],
        specs: AnalyseResult[],
        skipCharacterBest: boolean,
        includePostSeason: boolean,
    },
    configs: (data: AnalyseDataFile) => ConfigDisplay[],
}

const selectorData: SelectorData[] = [
    {
        label: () => getLocaleString('based-on-dungeon-best-run'),
        select: (data: AnalyseDataFile) => ({
            dungeons: data.dungeonsByRuns,
            specs: data.specsByRuns,
            skipCharacterBest: false,
            includePostSeason: data.statistics.includePostSeason,
        }),
        configs: (data: AnalyseDataFile) => ([
            {
                name: getLocaleString('season'),
                value: data.config.season,
            },
            {
                name: getLocaleString('config-max-page'),
                value: data.config.maxPage.toString(),
            },
            {
                name: getLocaleString('config-min-level'),
                value: data.config.dungeonMinLevel.toString(),
            },
            {
                name: getLocaleString('dungeon-min-level'),
                value: data.statistics.dungeonMinLevel.toString(),
            },
        ]),
    },
    {
        label: () => getLocaleString('based-on-character-best-record'),
        select: (data: AnalyseDataFile) => ({
            dungeons: data.dungeonsByCharacters,
            specs: data.specsByCharacters,
            skipCharacterBest: data.config.skipCharacterBest,
            includePostSeason: data.statistics.includePostSeason,
        }),
        configs: (data: AnalyseDataFile) => ([
            {
                name: getLocaleString('season'),
                value: data.config.season,
            },
            {
                name: getLocaleString('config-max-page'),
                value: data.config.maxPage.toString(),
            },
            {
                name: getLocaleString('config-min-score'),
                value: data.config.characterMinScore.toString(),
            },
            {
                name: getLocaleString('character-min-score'),
                value: data.statistics.characterMinScore.toString(),
            },
        ]),
    },
];

const roleDisplayOrder = [
    'tank',
    'healer',
    'melee',
    'ranged',
];

const tierListData = [
    { tier: 'S', tierName: 'UR', className: 'legendary' },
    { tier: 'A', tierName: 'SSR', className: 'epic' },
    { tier: 'B', tierName: 'SR', className: 'rare' },
    { tier: 'C', tierName: 'R', className: 'uncommon' },
    { tier: 'D', tierName: 'N', className: 'common' },
    { tier: 'F', tierName: '💩', className: 'poor' },
];

let SELECTOR_USING_INDEX = 0;
let USE_DESCRIPTION_TEXT = false;
let USE_DETAIL_VIEW = false;
let USE_ALT_TIER_NAMES = false;

const buttonData: ButtonData[] = [
    {
        getTitle: () => getLocaleString('button-refresh'),
        isRefresh: true,
        isActive: () => false,
    },
    {
        getTitle: () => getLocaleString('button-switch'),
        isActive: () => false,
        onClick: () => {
            SELECTOR_USING_INDEX += 1;
            if (SELECTOR_USING_INDEX >= selectorData.length) {
                SELECTOR_USING_INDEX = 0;
            }
        },
    },
    {
        getTitle: () => getLocaleString('button-toggle-description'),
        isActive: () => USE_DESCRIPTION_TEXT,
        onClick: () => {
            USE_DESCRIPTION_TEXT = !USE_DESCRIPTION_TEXT;
        },
    },
    {
        getTitle: () => getLocaleString('button-toggle-details'),
        isActive: () => USE_DETAIL_VIEW,
        onClick: () => {
            USE_DETAIL_VIEW = !USE_DETAIL_VIEW;
        },
    },
    {
        getTitle: () => getLocaleString('button-toggle-emoji'),
        isActive: () => USE_ALT_TIER_NAMES,
        onClick: () => {
            USE_ALT_TIER_NAMES = !USE_ALT_TIER_NAMES;
        },
    },
];

const renderConfigTable = (
    parent: HTMLDivElement,
    displays: ConfigDisplay[],
) => {
    const table = document.createElement('table');
    table.classList.add('table');
    parent.appendChild(table);

    const thead = document.createElement('thead');
    table.appendChild(thead);

    const theadTr = document.createElement('tr');
    thead.appendChild(theadTr);

    displays.forEach((config) => {
        const th = document.createElement('th');
        th.textContent = config.name;
        theadTr.appendChild(th);
    });

    const tr = document.createElement('tr');
    table.appendChild(tr);

    displays.forEach((config) => {
        const td = document.createElement('td');
        td.textContent = config.value;
        tr.appendChild(td);
    });
};

const renderDetailTable = (
    parent: HTMLDivElement,
    season: string,
    title: string,
    prefix: 'dungeon' | 'specialization',
    data: AnalyseResult[],
) => {
    const header = document.createElement('div');
    header.classList.add('title');
    header.textContent = title;
    parent.appendChild(header);

    const table = document.createElement('table');
    table.classList.add('table');
    parent.appendChild(table);

    const thead = document.createElement('thead');
    table.appendChild(thead);

    const theadTr = document.createElement('tr');
    thead.appendChild(theadTr);

    const theadName = document.createElement('th');
    theadName.textContent = getLocaleString('name');
    theadTr.appendChild(theadName);

    const theadTier = document.createElement('th');
    theadTier.textContent = getLocaleString('tier');
    theadTr.appendChild(theadTier);

    const theadN = document.createElement('th');
    theadN.textContent = getLocaleString('n');
    theadTr.appendChild(theadN);

    const theadMin = document.createElement('th');
    theadMin.textContent = getLocaleString('min');
    theadTr.appendChild(theadMin);

    const theadMax = document.createElement('th');
    theadMax.textContent = getLocaleString('max');
    theadTr.appendChild(theadMax);

    const theadMean = document.createElement('th');
    theadMean.textContent = getLocaleString('mean');
    theadTr.appendChild(theadMean);

    const theadSD = document.createElement('th');
    theadSD.textContent = getLocaleString('sd');
    theadTr.appendChild(theadSD);

    const theadCI = document.createElement('th');
    theadCI.textContent = getLocaleString('ci');
    theadTr.appendChild(theadCI);

    data.forEach((item) => {
        const tr = document.createElement('tr');
        table.appendChild(tr);

        const name = document.createElement('td');
        name.textContent = prefix === 'dungeon' ? getDungeonName(item.key) : gettSpecializationName(item.key);
        tr.appendChild(name);

        const tier = document.createElement('td');
        tier.textContent = USE_ALT_TIER_NAMES
            ? tierListData.find((d) => d.tier === item.tier)?.tierName ?? item.tier
            : item.tier;
        tr.appendChild(tier);

        const n = document.createElement('td');
        n.textContent = item.n.toString();
        tr.appendChild(n);

        const min = document.createElement('td');
        tr.appendChild(min);

        if (item.min?.type === 'run') {
            const minLink = document.createElement('a');
            minLink.href = `https://raider.io/mythic-plus-runs/${season}/${item.min.id.toString()}`;
            minLink.textContent = item.min.level.toString();
            min.appendChild(minLink);
        } else if (item.min?.type === 'character') {
            const minLink = document.createElement('a');
            minLink.href = `https://raider.io/characters/${item.min.path}?season=${season}`;
            minLink.textContent = item.min.score.toString();
            min.appendChild(minLink);
        }

        const max = document.createElement('td');
        tr.appendChild(max);

        if (item.max?.type === 'run') {
            const maxLink = document.createElement('a');
            maxLink.href = `https://raider.io/mythic-plus-runs/${season}/${item.max.id.toString()}`;
            maxLink.textContent = item.max.level.toString();
            max.appendChild(maxLink);
        } else if (item.max?.type === 'character') {
            const maxLink = document.createElement('a');
            maxLink.href = `https://raider.io/characters/${item.max.path}?season=${season}`;
            maxLink.textContent = item.max.score.toString();
            max.appendChild(maxLink);
        }

        const mean = document.createElement('td');
        mean.textContent = item.mean.toFixed(1);
        tr.appendChild(mean);

        const sd = document.createElement('td');
        sd.textContent = item.sd.toFixed(1);
        tr.appendChild(sd);

        const ci = document.createElement('td');
        ci.textContent = item.ci.toFixed(1);
        tr.appendChild(ci);
    });
};

const renderPage = (
    missingAlert: HTMLDivElement,
    postSeasonAlert: HTMLDivElement,
    tierContent: HTMLDivElement,
    dataFile: AnalyseDataFile,
) => {
    tierContent.replaceChildren();

    const {
        dungeons,
        specs,
        skipCharacterBest,
        includePostSeason,
    } = selectorData[SELECTOR_USING_INDEX].select(dataFile);

    if (skipCharacterBest) {
        tierContent.classList.remove('tier-list');
        tierContent.classList.add('tier-detail');

        missingAlert.classList.remove('hidden');
        postSeasonAlert.classList.add('hidden');

        return;
    }

    if (includePostSeason) {
        postSeasonAlert.classList.remove('hidden');
    } else {
        postSeasonAlert.classList.add('hidden');
    }

    missingAlert.classList.add('hidden');

    if (USE_DETAIL_VIEW) {
        tierContent.classList.remove('tier-list');
        tierContent.classList.add('tier-detail');

        renderConfigTable(tierContent, selectorData[SELECTOR_USING_INDEX].configs(dataFile));

        renderDetailTable(tierContent, dataFile.config.season, getLocaleString('dungeon'), 'dungeon', dungeons);

        roleDisplayOrder.forEach((role) => {
            const roleSpecs = specs.filter((spec) => specializations
                .find((s) => s.id === spec.key)?.role === role);

            renderDetailTable(tierContent, dataFile.config.season, getLocaleString(role), 'specialization', roleSpecs);
        });
    } else {
        tierContent.classList.remove('tier-detail');
        tierContent.classList.add('tier-list');

        [
            getLocaleString('dungeon'),
            ...roleDisplayOrder.map((role) => getLocaleString(role)),
        ].forEach((text, index) => {
            const header = document.createElement('div');
            header.style.gridColumn = (index + 2).toString();
            header.style.gridRow = '1';
            header.classList.add('tier-header');
            header.textContent = text;
            tierContent.appendChild(header);
        });

        tierListData.forEach((tierData, index) => {
            const gridRow = (index + 2).toString();
            const tierDungeons = dungeons.filter((dungeon) => dungeon.tier === tierData.tier);
            const tierSpecs = specs.filter((spec) => spec.tier === tierData.tier);

            const tierTitle = document.createElement('div');
            tierTitle.style.gridColumn = '1';
            tierTitle.style.gridRow = gridRow;
            tierTitle.classList.add('tier-title', tierData.className, USE_ALT_TIER_NAMES ? 'alt-name' : 'normal-name');
            tierTitle.textContent = USE_ALT_TIER_NAMES ? tierData.tierName : tierData.tier;
            tierContent.appendChild(tierTitle);

            {
                const tierContainer = document.createElement('div');
                tierContainer.style.gridColumn = '2';
                tierContainer.style.gridRow = gridRow;
                tierContainer.classList.add('tier-container');
                tierContent.appendChild(tierContainer);

                tierDungeons.forEach((dungeon) => {
                    const entry = document.createElement('div');
                    entry.classList.add('tier-item');
                    tierContainer.appendChild(entry);

                    const image = document.createElement('img');
                    image.src = `static/dungeons/${dungeon.key.toString()}.png`;
                    entry.appendChild(image);

                    if (USE_DESCRIPTION_TEXT) {
                        const description = document.createElement('div');
                        description.classList.add('description');
                        description.textContent = getDungeonShortName(dungeon.key);
                        entry.appendChild(description);
                    }
                });
            }

            roleDisplayOrder.forEach((role, i) => {
                const roleData = tierSpecs.filter((spec) => specializations
                    .find((s) => s.id === spec.key)?.role === role);

                const tierContainer = document.createElement('div');
                tierContainer.style.gridColumn = (3 + i).toString();
                tierContainer.style.gridRow = gridRow;
                tierContainer.classList.add('tier-container');
                tierContent.appendChild(tierContainer);

                roleData.forEach((spec) => {
                    const entry = document.createElement('div');
                    entry.classList.add('tier-item');
                    tierContainer.appendChild(entry);

                    const image = document.createElement('img');
                    image.src = `static/specializations/${spec.key.toString()}.png`;
                    entry.appendChild(image);

                    if (USE_DESCRIPTION_TEXT) {
                        const description = document.createElement('div');
                        description.classList.add('description');
                        description.textContent = getSpecializationShortName(spec.key);
                        entry.appendChild(description);
                    }
                });
            });
        });
    }
};

const updatePageDisplay = (
    subTitle: HTMLDivElement,
    lastUpdated: HTMLDivElement,
    buttonContainer: HTMLDivElement,
    dataFile: AnalyseDataFile | undefined,
) => {
    // eslint-disable-next-line no-param-reassign
    subTitle.textContent = selectorData[SELECTOR_USING_INDEX].label();
    // eslint-disable-next-line no-param-reassign
    lastUpdated.textContent = dataFile
        ? new Date(dataFile.date).toLocaleString()
        : '';

    [...buttonContainer.children].forEach((child, index) => {
        if (buttonData.length > index) {
            if (buttonData[index].isActive()) {
                child.classList.add('active');
            } else {
                child.classList.remove('active');
            }
        }
    });
};

const initializePage = () => {
    const title = document.getElementById('title');
    if (!(title instanceof HTMLDivElement)) {
        console.error('Failing to find #title');
        return;
    }

    const subTitle = document.getElementById('subTitle');
    if (!(subTitle instanceof HTMLDivElement)) {
        console.error('Failing to find #subTitle');
        return;
    }

    const lastUpdated = document.getElementById('lastUpdated');
    if (!(lastUpdated instanceof HTMLDivElement)) {
        console.error('Failing to find #lastUpdated');
        return;
    }

    const buttonContainer = document.getElementById('buttonContainer');
    if (!(buttonContainer instanceof HTMLDivElement)) {
        console.error('Failing to find #buttonContainer');
        return;
    }

    const seasonSelector = document.getElementById('seasonSelector');
    if (!(seasonSelector instanceof HTMLSelectElement)) {
        console.error('Failing to find #seasonSelector');
        return;
    }

    const loadDataError = document.getElementById('loadDataError');
    if (!(loadDataError instanceof HTMLDivElement)) {
        console.error('Failing to find #loadDataError');
        return;
    }

    const missingAlert = document.getElementById('missingAlert');
    if (!(missingAlert instanceof HTMLDivElement)) {
        console.error('Failing to find #missingAlert');
        return;
    }

    const postSeasonAlert = document.getElementById('postSeasonAlert');
    if (!(postSeasonAlert instanceof HTMLDivElement)) {
        console.error('Failing to find #postSeasonAlert');
        return;
    }

    const tierContent = document.getElementById('tierContent');
    if (!(tierContent instanceof HTMLDivElement)) {
        console.error('Failing to find #tierContent');
        return;
    }

    let dataFile: AnalyseDataFile | undefined;

    const refresh = () => fetch(seasonSelector.value === 'current' ? 'data.json' : `legacy/${seasonSelector.value}.json`)
        .then((res) => res.json())
        .then((newDataFile: AnalyseDataFile) => {
            dataFile = newDataFile;

            loadDataError.classList.add('hidden');

            const currentSeasonOption = [...seasonSelector.options].find((option) => option.value === 'current');
            if (seasonSelector.value === 'current' && currentSeasonOption) {
                currentSeasonOption.textContent = `${getLocaleString('current-season')} - ${getSeasonName(dataFile.config.season)}`;
            }

            updatePageDisplay(subTitle, lastUpdated, buttonContainer, dataFile);
            renderPage(missingAlert, postSeasonAlert, tierContent, dataFile);
        })
        .catch((error: unknown) => {
            dataFile = undefined;

            tierContent.classList.remove('tier-list');
            tierContent.classList.add('tier-detail');
            tierContent.replaceChildren();

            loadDataError.classList.remove('hidden');
            missingAlert.classList.add('hidden');
            postSeasonAlert.classList.add('hidden');

            updatePageDisplay(subTitle, lastUpdated, buttonContainer, dataFile);

            throw error;
        });

    const doRefresh = () => {
        refresh()
            .catch(console.error);
    };

    [...buttonContainer.children].forEach((child, index) => {
        if (buttonData.length > index) {
            child.setAttribute('title', buttonData[index].getTitle());

            if (buttonData[index].isRefresh !== undefined) {
                child.addEventListener('click', doRefresh);
            } else if (buttonData[index].onClick) {
                child.addEventListener('click', () => {
                    buttonData[index].onClick?.();

                    updatePageDisplay(subTitle, lastUpdated, buttonContainer, dataFile);

                    if (dataFile) {
                        renderPage(missingAlert, postSeasonAlert, tierContent, dataFile);
                    }
                });
            }
        }
    });

    [...seasonSelector.options].forEach((option) => {
        if (option.value === 'current') {
            // eslint-disable-next-line no-param-reassign
            option.textContent = getLocaleString('current-season');
        } else {
            // eslint-disable-next-line no-param-reassign
            option.textContent = getSeasonName(option.value);
        }
    });
    seasonSelector.addEventListener('change', doRefresh);

    title.textContent = getLocaleString('title');
    loadDataError.textContent = getLocaleString('load-data-error');
    missingAlert.textContent = getLocaleString('missing-character-best-record');
    postSeasonAlert.textContent = getLocaleString('include-post-season');

    doRefresh();
};

document.addEventListener('DOMContentLoaded', () => {
    selectLanguage(navigator.language);

    document.title = getLocaleString('title');

    initializePage();
});
