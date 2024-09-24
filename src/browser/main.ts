/* eslint-env browser */
/* eslint-disable no-console */

import { specID2ImageName, mapID2ImageName } from './data.ts';
import {
    tanks, healers, melees, rangeds,
} from '../data.ts';

import { getLocaleString } from '../locale.ts';
import '../locales/en.ts';
import '../locales/zhCN.ts';

import type { AnalyseResult, DataFile } from '../types.ts';

const { language } = navigator;

const tierListData = [
    { tier: 'S', className: 'legendary' },
    { tier: 'A', className: 'epic' },
    { tier: 'B', className: 'rare' },
    { tier: 'C', className: 'uncommon' },
    { tier: 'D', className: 'common' },
    { tier: 'F', className: 'poor' },
];

const renderData = (root: HTMLDivElement, tierType: 'map' | 'spec', title:string, res: AnalyseResult[]) => {
    const card = document.createElement('div');
    card.classList.add('card');
    root.appendChild(card);

    const cardTitle = document.createElement('div');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = title;
    card.appendChild(cardTitle);

    tierListData.forEach(({ tier, className }) => {
        const tierRow = document.createElement('div');
        tierRow.classList.add('tier-row');
        card.appendChild(tierRow);

        const tierTitle = document.createElement('div');
        tierTitle.classList.add('tier-title');
        tierTitle.classList.add(className);
        tierRow.appendChild(tierTitle);

        const tierText = document.createElement('div');
        tierText.textContent = tier;
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

const updateData = async (cardContainer: HTMLDivElement, lastUpdate: HTMLDivElement) => {
    const data = await (await fetch('/data.json')).json() as DataFile;
    const { date, dungeons, specs } = data;

    // eslint-disable-next-line no-param-reassign
    lastUpdate.textContent = new Date(date).toLocaleString();

    cardContainer.replaceChildren();
    renderData(cardContainer, 'map', getLocaleString('dungeon', language), dungeons);
    renderData(cardContainer, 'spec', getLocaleString('tank', language), specs.filter((spec) => tanks.includes(spec.key)));
    renderData(cardContainer, 'spec', getLocaleString('healer', language), specs.filter((spec) => healers.includes(spec.key)));
    renderData(cardContainer, 'spec', getLocaleString('melee', language), specs.filter((spec) => melees.includes(spec.key)));
    renderData(cardContainer, 'spec', getLocaleString('ranged', language), specs.filter((spec) => rangeds.includes(spec.key)));
};

document.addEventListener('DOMContentLoaded', () => {
    document.title = getLocaleString('title', language);

    const regionBest = document.querySelector('#app .region-best');
    if (regionBest) {
        regionBest.textContent = getLocaleString('by-region-best-run', language);
    }

    const characterBest = document.querySelector('#app .character-best');
    if (characterBest) {
        characterBest.textContent = getLocaleString('by-character-best-record', language);
    }

    const cardContainer = document.querySelector('#app .card-container');
    const lastUpdate = document.querySelector('#app .last-update');
    if (!(cardContainer instanceof HTMLDivElement) || !(lastUpdate instanceof HTMLDivElement)) {
        console.error('Failing to find key elements.');
        return;
    }

    updateData(cardContainer, lastUpdate).catch((err: unknown) => {
        console.error(err);
    });
});
