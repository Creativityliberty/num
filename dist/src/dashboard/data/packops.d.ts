type PackOpsModeRow = {
    id: string;
    validate: {
        ok: boolean;
        error?: string;
        code?: string;
    };
    simulate: {
        ok: boolean;
        ticks?: number;
        parallelGroups?: number;
        error?: string;
        code?: string;
    };
};
export type PackOpsReport = {
    ok: boolean;
    ts: string;
    reportId: string;
    packId: string;
    imported?: {
        ok: boolean;
        importedCount: number;
        warnings: unknown[];
        writtenFiles: string[];
        packJsonPath?: string;
    };
    stats: {
        total: number;
        valid: number;
        invalid: number;
        simulated: number;
        simulateFailed: number;
        topErrors: Record<string, number>;
        topSimErrors: Record<string, number>;
    };
    modes: PackOpsModeRow[];
};
export declare function runPackOps(opts: {
    root: string;
    packId: string;
    modeIds: string[];
    validateOne: (id: string) => Promise<unknown>;
    simulateOne: (id: string) => Promise<unknown>;
    importResult?: unknown;
}): Promise<{
    reportId: string;
    file: string;
    report: PackOpsReport;
}>;
export {};
