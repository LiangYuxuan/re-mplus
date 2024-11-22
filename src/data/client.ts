import { CASCClient } from '@rhyster/wow-casc-dbc';

import type { Version } from '@rhyster/wow-casc-dbc';

const region = 'us';
const products = [
    'wowt',
    'wowxptr',
    'wow_beta',
];

const versions = await Promise.all(products.map(async (product) => {
    const version = await CASCClient.getProductVersion(region, product);
    return {
        product,
        version,
    };
}));

// eslint-disable-next-line import-x/prefer-default-export
export const latestVersion = versions
    .filter((data): data is { product: string, version: Version } => !!data.version)
    .reduce((prev, data) => {
        const version = data.version.VersionsName;
        const [
            major,
            minor,
            patch,
            build,
        ] = version
            .split('.')
            .map((v) => parseInt(v, 10));
        const [
            prevMajor,
            prevMinor,
            prevPatch,
            prevBuild,
        ] = prev.version.VersionsName.split('.').map((v) => parseInt(v, 10));

        if (major > prevMajor) {
            return data;
        }
        if (major === prevMajor) {
            if (minor > prevMinor) {
                return data;
            }
            if (minor === prevMinor) {
                if (patch > prevPatch) {
                    return data;
                }
                if (patch === prevPatch) {
                    if (build > prevBuild) {
                        return data;
                    }
                }
            }
        }

        return prev;
    });
