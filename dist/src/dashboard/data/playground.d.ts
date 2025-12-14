import type { ModesRegistry } from "../../core/modes.registry.js";
export declare function simulateMode(registry: ModesRegistry, modeId: string): {
    ok: boolean;
    result: Promise<{
        ok: boolean;
        ticks: string[][];
        blockedBy: Record<string, string[]>;
        parallel: string[][];
    } | {
        ok: false;
        error: string;
    }>;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    result?: undefined;
};
export declare function validateMode(registry: ModesRegistry, modeId: string): {
    ok: boolean;
    result: Promise<{
        ok: boolean;
        errors: import("../../core/modes.registry.js").ValidationError[];
        topo?: string[][];
    }>;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    result?: undefined;
};
