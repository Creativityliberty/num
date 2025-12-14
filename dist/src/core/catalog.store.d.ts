import { type Catalog } from "./catalog.schema.js";
export declare class CatalogStore {
    private opts;
    constructor(opts: {
        catalogPath: string;
    });
    load(): Promise<Catalog>;
}
