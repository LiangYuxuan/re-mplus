/* eslint-env browser */
/* eslint-disable no-console */

import { specID2ImageName, mapID2ImageName } from './data.ts';
import specializations from '../data.ts';

import { selectLanguage, getLocaleString } from '../locale.ts';
import '../locales/en.ts';
import '../locales/zhCN.ts';

import type { AnalyseResult, AnalyseDataFile } from '../types.ts';

const tierListData = [
    { tier: 'S', tierName: 'UR', className: 'legendary' },
    { tier: 'A', tierName: 'SSR', className: 'epic' },
    { tier: 'B', tierName: 'SR', className: 'rare' },
    { tier: 'C', tierName: 'R', className: 'uncommon' },
    { tier: 'D', tierName: 'N', className: 'common' },
    { tier: 'F', tierName: '💩', className: 'poor' },
];

let SELECTOR_USING_INDEX = 0;
let USE_ALT_TIER_NAMES = false;

const renderData = (root: HTMLDivElement, tierType: 'map' | 'spec', title:string, res: AnalyseResult[]) => {
    const card = document.createElement('div');
    card.classList.add('card');
    root.appendChild(card);

    const cardTitle = document.createElement('div');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = title;
    card.appendChild(cardTitle);

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

        const tierData = res.filter((item) => item.tier === tier);
        tierData.forEach((item) => {
            const imageName = tierType === 'map' ? mapID2ImageName.get(item.key) : specID2ImageName.get(item.key);
            if (!imageName) {
                console.error(`Image name not found for key: ${tierType} ${item.key.toString()}`);
                return;
            }

            const imageURL = tierType === 'map'
                ? `https://assets.rpglogs.com/img/warcraft/bosses/${imageName}-icon.jpg`
                : `https://assets.rpglogs.com/img/warcraft/icons/large/${imageName}.jpg`;

            const tierItem = document.createElement('div');
            tierItem.classList.add('tier-item');
            tierContent.appendChild(tierItem);

            const tierImage = document.createElement('img');
            tierImage.src = imageURL;
            tierItem.appendChild(tierImage);
        });
    });
};

const updateData = async (
    selectors: HTMLDivElement[],
    lastUpdate: HTMLDivElement,
    cardContainer: HTMLDivElement,
) => {
    const data = await (await fetch('/data.json')).json() as AnalyseDataFile;
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
