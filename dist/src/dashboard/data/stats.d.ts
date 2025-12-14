export declare function computeRoleDurationsFromRun(run: any): Record<string, {
    count: number;
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
}>;
export declare function computeStats(workspaceRoot: string, range: string): Promise<{
    range: string;
    total: number;
    states: Record<string, number>;
    successRatePct: number;
    topModes: {
        modeId: string;
        count: number;
    }[];
    topCommands: {
        command: string;
        count: number;
        failRatePct: number;
    }[];
    avgDurationsMs: Record<string, {
        avg: number;
        p50: number;
        p95: number;
    }>;
    roleDurations: Record<string, {
        count: number;
        avgMs: number;
        p50Ms: number;
        p95Ms: number;
    }>;
}>;
