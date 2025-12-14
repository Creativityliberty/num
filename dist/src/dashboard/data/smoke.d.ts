export type SmokeStrategy = "core+chefs" | "uniform-random" | "by-tags";
export type SmokeStartInput = {
    packId: string;
    sample: number;
    strategy: SmokeStrategy;
    tags?: string[];
    autoApply?: boolean;
    dryRun?: boolean;
    modePrefix?: string;
};
export type SmokeItemResult = {
    modeId: string;
    ok: boolean;
    state?: string;
    runId?: string;
    error?: string;
    blockedByPolicy?: boolean;
};
export type SmokeReport = {
    ok: boolean;
    ts: string;
    smokeId: string;
    input: SmokeStartInput;
    selected: string[];
    chefs: string[];
    results: SmokeItemResult[];
    summary: {
        total: number;
        ok: number;
        failed: number;
        blocked: number;
    };
};
export declare function selectSmokeModes(opts: {
    allModes: {
        id: string;
        tags?: string[];
    }[];
    input: SmokeStartInput;
}): {
    chefs: string[];
    selected: string[];
};
export declare function runSmoke(opts: {
    root: string;
    input: SmokeStartInput;
    allModes: {
        id: string;
        tags?: string[];
    }[];
    validateOne: (id: string) => Promise<unknown>;
    simulateOne: (id: string) => Promise<unknown>;
    runOne?: (modeId: string, input: SmokeStartInput) => Promise<{
        ok: boolean;
        runId?: string;
        state?: string;
        error?: unknown;
        blockedByPolicy?: boolean;
    }>;
}): Promise<{
    smokeId: string;
    file: string;
    report: SmokeReport;
}>;
