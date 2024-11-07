/* eslint-disable import-x/no-unused-modules */

import { RIO_SEASON } from '../core/config.ts';
import specializations from '../core/data.ts';

import { specID2ImageName, mapID2ImageName } from './data.ts';
import { selectLanguage, getLocaleString } from './locales/index.ts';

import type { AnalyseResult, AnalyseDataFile } from '../core/types.ts';

interface ButtonData {
    getTitle: () => string,
    isRefresh?: boolean,
    isActive: () => boolean,
    onClick?: () => void,
}

interface SelectorData {
    label: () => string,
    select: (data: AnalyseDataFile) => AnalyseResult[],
}

const selectorData: SelectorData[] = [
    {
        label: () => getLocaleString('based-on-region-best-run'),
        select: (data: AnalyseDataFile) => data.specsByRuns,
    },
    {
        label: () => getLocaleString('based-on-character-best-record'),
        select: (data: AnalyseDataFile) => data.specsByCharacters,
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

const renderDetailTable = (
    parent: HTMLDivElement,
    title: string,
    prefix: string,
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
        name.textContent = getLocaleString(`${prefix}-${item.key.toString()}`);
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

        const minLink = document.createElement('a');
        minLink.href = `https://raider.io/mythic-plus-runs/${RIO_SEASON}/${item.min.id.toString()}`;
        minLink.textContent = item.min.level.toString();
        min.appendChild(minLink);

        const max = document.createElement('td');
        tr.appendChild(max);

        const maxLink = document.createElement('a');
        maxLink.href = `https://raider.io/mythic-plus-runs/${RIO_SEASON}/${item.max.id.toString()}`;
        maxLink.textContent = item.max.level.toString();
        max.appendChild(maxLink);

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
    tierContent: HTMLDivElement,
    dataFile: AnalyseDataFile,
) => {
    tierContent.replaceChildren();

    const dungeons = dataFile.dungeonsByRuns;
    const specs = selectorData[SELECTOR_USING_INDEX].select(dataFile);

    if (USE_DETAIL_VIEW) {
        tierContent.classList.remove('tier-list');
        tierContent.classList.add('tier-detail');

        renderDetailTable(tierContent, getLocaleString('dungeon'), 'map', dungeons);

        roleDisplayOrder.forEach((role) => {
            const roleSpecs = specs.filter((spec) => specializations
                .find((s) => s.id === spec.key)?.role === role);

            renderDetailTable(tierContent, getLocaleString(role), 'spec', roleSpecs);
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
                    const imageName = mapID2ImageName.get(dungeon.key) ?? dungeon.key.toString();

                    const entry = document.createElement('div');
                    entry.classList.add('tier-item');
                    tierContainer.appendChild(entry);

                    const image = document.createElement('img');
                    image.src = `https://assets.rpglogs.com/img/warcraft/bosses/${imageName}-icon.jpg`;
                    entry.appendChild(image);

                    if (USE_DESCRIPTION_TEXT) {
                        const description = document.createElement('div');
                        description.classList.add('description');
                        description.textContent = getLocaleString(`map-${dungeon.key.toString()}`).substring(0, 2);
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
                    const imageName = specID2ImageName.get(spec.key) ?? spec.key.toString();

                    const entry = document.createElement('div');
                    entry.classList.add('tier-item');
                    tierContainer.appendChild(entry);

                    const image = document.createElement('img');
                    image.src = `https://assets.rpglogs.com/img/warcraft/icons/large/${imageName}.jpg`;
                    entry.appendChild(image);

                    if (USE_DESCRIPTION_TEXT) {
                        const description = document.createElement('div');
                        description.classList.add('description');
                        description.textContent = getLocaleString(`spec-${spec.key.toString()}`).substring(0, 2);
                        entry.appendChild(description);
                    }
                });
            });
        });
    }
};

const updatePageDisplay = (
    title: HTMLDivElement,
    subTitle: HTMLDivElement,
    lastUpdated: HTMLDivElement,
    buttonContainer: HTMLDivElement,
    dataFile: AnalyseDataFile,
) => {
    // eslint-disable-next-line no-param-reassign
    title.textContent = getLocaleString('title');
    // eslint-disable-next-line no-param-reassign
    subTitle.textContent = selectorData[SELECTOR_USING_INDEX].label();
    // eslint-disable-next-line no-param-reassign
    lastUpdated.textContent = new Date(dataFile.date).toLocaleString();

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

const initializePage = async () => {
    let dataFile = await (await fetch('data.json')).json() as AnalyseDataFile;

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

    const tierContent = document.getElementById('tierContent');
    if (!(tierContent instanceof HTMLDivElement)) {
        console.error('Failing to find #tierContent');
        return;
    }

    [...buttonContainer.children].forEach((child, index) => {
        if (buttonData.length > index) {
            child.setAttribute('title', buttonData[index].getTitle());

            if (buttonData[index].isRefresh !== undefined) {
                child.addEventListener('click', () => {
                    fetch('data.json')
                        .then((res) => res.json())
                        .then((newDataFile: AnalyseDataFile) => {
                            dataFile = newDataFile;
                            renderPage(tierContent, dataFile);
                        })
                        .catch((error: unknown) => {
                            console.error(error);
                        });
                });
            } else if (buttonData[index].onClick) {
                child.addEventListener('click', () => {
                    buttonData[index].onClick?.();

                    updatePageDisplay(title, subTitle, lastUpdated, buttonContainer, dataFile);
                    renderPage(tierContent, dataFile);
                });
            }
        }
    });

    updatePageDisplay(title, subTitle, lastUpdated, buttonContainer, dataFile);
    renderPage(tierContent, dataFile);
};

document.addEventListener('DOMContentLoaded', () => {
    selectLanguage(navigator.language);

    document.title = getLocaleString('title');

    initializePage()
        .catch((error: unknown) => {
            console.error(error);
        });
});
