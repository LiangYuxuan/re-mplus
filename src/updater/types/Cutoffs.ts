/* eslint-disable @typescript-eslint/naming-convention */

interface Region {
    name: string,
    slug: string,
    short_name: string,
}

interface FactionQuantileData {
    quantile: number,
    quantileMinValue: number,
    quantilePopulationCount: number,
    quantilePopulationFraction: number,
    totalPopulationCount: number,
}

interface QuantileData {
    horde: FactionQuantileData,
    hordeColor: string,
    alliance: FactionQuantileData,
    allianceColor: string,
    all: FactionQuantileData,
    allColor: string,
}

interface GraphData {
    type: string,
    name: string,
    data: {
        x: number,
        y: number,
        total: number,
    }[],
    color: string,
    marker: {
        enabled: boolean,
    },
}

interface QuantileDataWithScore extends QuantileData {
    score: number,
}

interface AllTimed {
    score: number,
    cutoffs: QuantileDataWithScore,
}

export default interface Cutoffs {
    cutoffs: {
        updatedAt: string,
        region: Region,
        p999: QuantileData,
        p990: QuantileData,
        p900: QuantileData,
        p750: QuantileData,
        p600: QuantileData,
        graphData: {
            p999: GraphData,
            p990: GraphData,
            p900: GraphData,
            p750: GraphData,
            p600: GraphData,
        },
        keystoneHero: QuantileDataWithScore,
        keystoneMaster: QuantileDataWithScore,
        keystoneConqueror: QuantileDataWithScore,
        keystoneExplorer: null,
        bracketDungeonLevels: number[],
        isRemappedSeason: boolean,
        [key: `allTimed${number}`]: AllTimed,
    },
    ui: {
        season: string,
        region: string,
    },
}
