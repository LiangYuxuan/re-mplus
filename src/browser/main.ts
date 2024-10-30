/* eslint-disable import-x/no-unused-modules */

import { RIO_SEASON } from '../core/config.ts';
import specializations from '../core/data.ts';
import { selectLanguage, getLocaleString } from '../core/locales/index.ts';

import { specID2ImageName, mapID2ImageName } from './data.ts';

import type { AnalyseResult, AnalyseDataFile } from '../core/types.ts';

const tierListData = [
    { tier: 'S', tierName: 'UR', className: 'legendary' },
    { tier: 'A', tierName: 'SSR', className: 'epic' },
    { tier: 'B', tierName: 'SR', className: 'rare' },
    { tier: 'C', tierName: 'R', className: 'uncommon' },
    { tier: 'D', tierName: 'N', className: 'common' },
    { tier: 'F', tierName: '💩', className: 'poor' },
];

let SELECTOR_USING_INDEX = 0;
let USE_DETAIL_VIEW = false;
let USE_ALT_TIER_NAMES = false;

const renderData = (root: HTMLDivElement, tierType: 'map' | 'spec', title:string, data: AnalyseResult[]) => {
    const card = document.createElement('div');
    card.classList.add('card');
    root.appendChild(card);

    const cardTitle = document.createElement('div');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = title;
    card.appendChild(cardTitle);

    if (USE_DETAIL_VIEW) {
        const table = document.createElement('table');
        table.classList.add('table');
        card.appendChild(table);

        const thead = document.createElement('thead');
        table.appendChild(thead);

        const theadTr = document.createElement('tr');
        thead.appendChild(theadTr);

        const theadName = document.createElement('th');
        theadName.textContent = getLocaleString('name');
        theadTr.appendChild(theadName);

        const theadN = document.createElement('th');
        theadN.textContent = getLocaleString('n');
        theadTr.appendChild(theadN);

        const theadMax = document.createElement('th');
        theadMax.textContent = getLocaleString('max');
        theadTr.appendChild(theadMax);

        const theadCI = document.createElement('th');
        theadCI.textContent = getLocaleString('ci');
        theadTr.appendChild(theadCI);

        data.forEach((item) => {
            const tr = document.createElement('tr');
            table.appendChild(tr);

            const name = document.createElement('td');
            name.textContent = getLocaleString(tierType === 'map' ? `map-${item.key.toString()}` : `spec-${item.key.toString()}`);
            tr.appendChild(name);

            const n = document.createElement('td');
            n.textContent = item.n.toString();
            tr.appendChild(n);

            const max = document.createElement('td');
            tr.appendChild(max);

            const maxLink = document.createElement('a');
            maxLink.href = `https://raider.io/mythic-plus-runs/${RIO_SEASON}/${item.max.id.toString()}`;
            maxLink.textContent = item.max.level.toString();
            max.appendChild(maxLink);

            const ci = document.createElement('td');
            ci.textContent = item.ci.toFixed(1);
            tr.appendChild(ci);
        });
    } else {
        tierListData.forEach(({ tier, tierName, className }) => {
            const tierRow = document.createElement('div');
            tierRow.classList.add('tier-row');
            card.appendChild(tierRow);

            const tierTitle = document.createElement('div');
            tierTitle.classList.add('tier-title');
            tierTitle.classList.add(className);
            tierRow.appendChild(tierTitle);

            const tierText = document.createElement('div');
            tierTitle.classList.add(USE_ALT_TIER_NAMES ? 'alt-name' : 'normal-name');
            tierText.textContent = USE_ALT_TIER_NAMES ? tierName : tier;
            tierTitle.appendChild(tierText);

            const tierList = document.createElement('div');
            tierList.classList.add('tier-list');
            tierRow.appendChild(tierList);

            const tierContent = document.createElement('div');
            tierContent.classList.add('tier-content');
            tierList.appendChild(tierContent);

            const tierData = data.filter((item) => item.tier === tier);
            tierData.forEach((item) => {
                const imageName = tierType === 'map' ? mapID2ImageName.get(item.key) : specID2ImageName.get(item.key);
                if (!imageName) {
                    console.error(`Image name not found for key: ${tierType} ${item.key.toString()}`);
                    return;
                }

                const imageURL = `https://assets.rpglogs.com/img/warcraft/${tierType === 'map' ? `bosses/${imageName}-icon` : `icons/large/${imageName}`}.jpg`;

                const tierItem = document.createElement('div');
                tierItem.classList.add('tier-item');
                tierContent.appendChild(tierItem);

                const tierImage = document.createElement('img');
                tierImage.src = imageURL;
                tierItem.appendChild(tierImage);
            });
        });
    }
};

const updateData = async (
    selectors: HTMLDivElement[],
    lastUpdate: HTMLDivElement,
    cardContainer: HTMLDivElement,
) => {
    const data = await (await fetch('data.json')).json() as AnalyseDataFile;
    const {
        date, dungeonsByRuns, specsByRuns, specsByCharacters,
    } = data;

    const sources = [specsByRuns, specsByCharacters];
    const source = sources[SELECTOR_USING_INDEX];
    const tank = source.filter((spec) => specializations.find((s) => s.id === spec.key)?.role === 'tank');
    const healer = source.filter((spec) => specializations.find((s) => s.id === spec.key)?.role === 'healer');
    const melee = source.filter((spec) => specializations.find((s) => s.id === spec.key)?.role === 'melee');
    const ranged = source.filter((spec) => specializations.find((s) => s.id === spec.key)?.role === 'ranged');

    selectors.forEach((selector, index) => {
        if (index === SELECTOR_USING_INDEX) {
            selector.classList.add('using');
        } else {
            selector.classList.remove('using');
        }
    });

    // eslint-disable-next-line no-param-reassign
    lastUpdate.textContent = new Date(date).toLocaleString();

    cardContainer.replaceChildren();
    renderData(cardContainer, 'map', getLocaleString('dungeon'), dungeonsByRuns);
    renderData(cardContainer, 'spec', getLocaleString('tank'), tank);
    renderData(cardContainer, 'spec', getLocaleString('healer'), healer);
    renderData(cardContainer, 'spec', getLocaleString('melee'), melee);
    renderData(cardContainer, 'spec', getLocaleString('ranged'), ranged);
};

document.addEventListener('DOMContentLoaded', () => {
    selectLanguage(navigator.language);

    document.title = getLocaleString('title');

    const selectorContainer = document.querySelector('#app .card-type-selector');
    if (!(selectorContainer instanceof HTMLDivElement)) {
        console.error('Failing to find .card-type-selector');
        return;
    }

    const regionBest = document.createElement('div');
    regionBest.textContent = getLocaleString('by-region-best-run');
    selectorContainer.appendChild(regionBest);

    const characterBest = document.createElement('div');
    characterBest.textContent = getLocaleString('by-character-best-record');
    selectorContainer.appendChild(characterBest);

    const selectors = [regionBest, characterBest];

    const lastUpdate = document.querySelector('#app .last-update');
    if (!(lastUpdate instanceof HTMLDivElement)) {
        console.error('Failing to find .last-update');
        return;
    }

    const cardContainer = document.querySelector('#app .card-container');
    if (!(cardContainer instanceof HTMLDivElement)) {
        console.error('Failing to find .card-container');
        return;
    }

    selectors.forEach((selector, index) => {
        selector.addEventListener('click', () => {
            SELECTOR_USING_INDEX = index;
            updateData(selectors, lastUpdate, cardContainer).catch((err: unknown) => {
                console.error(err);
            });
        });
    });

    lastUpdate.addEventListener('click', () => {
        USE_DETAIL_VIEW = !USE_DETAIL_VIEW;
        updateData(selectors, lastUpdate, cardContainer).catch((err: unknown) => {
            console.error(err);
        });
    });

    lastUpdate.addEventListener('dblclick', () => {
        USE_ALT_TIER_NAMES = !USE_ALT_TIER_NAMES;
        updateData(selectors, lastUpdate, cardContainer).catch((err: unknown) => {
            console.error(err);
        });
    });

    updateData(selectors, lastUpdate, cardContainer).catch((err: unknown) => {
        console.error(err);
    });
});
