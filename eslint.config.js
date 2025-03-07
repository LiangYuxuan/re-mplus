import { core, node, browser } from '@rhyster/eslint-config';

export default [
    ...core.map((config) => ({
        ...config,
        files: ['src/core/**/*.ts'],
    })),
    ...node.map((config) => ({
        ...config,
        files: ['src/data/**/*.ts'],
    })),
    ...node.map((config) => ({
        ...config,
        files: ['src/updater/**/*.ts'],
    })),
    ...browser.map((config) => ({
        ...config,
        files: ['src/browser/**/*.ts'],
    })),
];
