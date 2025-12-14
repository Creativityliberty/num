import type { UniversalMode } from "./schemas.js";
export declare class ModeRegistry {
    private byId;
    private all;
    static fromPaths(paths: string[]): Promise<ModeRegistry>;
    load(paths: string[]): Promise<void>;
    list(filter?: {
        query?: string;
        tag?: string;
        category?: string;
    }): UniversalMode[];
    get(id: string): UniversalMode | undefined;
    allModes(): UniversalMode[];
    count(): number;
}
