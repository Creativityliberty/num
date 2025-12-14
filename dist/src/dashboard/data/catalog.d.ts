export type CatalogMode = {
    id: string;
    name: string;
    tags: string[];
    capabilities: string[];
    isChef: boolean;
    isStub: boolean;
    isAlias: boolean;
    disabled: boolean;
    source: string;
    version: string;
    flow: {
        nodes: number;
        edges: number;
    };
};
export type CatalogStats = {
    total: number;
    byTag: Record<string, number>;
    byCapability: Record<string, number>;
    chefs: number;
    stubs: number;
    aliases: number;
    disabled: number;
    enabled: number;
};
export type Catalog = {
    packId: string;
    count: number;
    generatedAt: string;
    stats: CatalogStats;
    modes: CatalogMode[];
};
export declare function buildCatalog(opts: {
    packId: string;
    modesDir: string;
}): Catalog;
export declare function writeCatalog(opts: {
    packId: string;
    modesDir: string;
    packOutDir: string;
}): {
    catalogPath: string;
    catalog: Catalog;
};
export declare function loadCatalog(packOutDir: string): Catalog | null;
