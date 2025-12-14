export type CacheEntry = {
    key: string;
    value: Record<string, unknown>;
    ttl: number;
    createdAt: number;
};
export declare class CacheManager {
    private cache;
    private ttlMs;
    constructor(ttlSeconds?: number);
    set(key: string, value: Record<string, unknown>): void;
    get(key: string): Record<string, unknown> | null;
    clear(): void;
    stats(): Record<string, unknown>;
}
export type IndexEntry = {
    id: string;
    type: string;
    tags: string[];
    searchText: string;
};
export declare class IndexManager {
    private index;
    private root;
    constructor(root: string);
    add(entry: IndexEntry): void;
    search(query: string): IndexEntry[];
    searchByTag(tag: string): IndexEntry[];
    save(): void;
    load(): void;
    stats(): Record<string, unknown>;
}
