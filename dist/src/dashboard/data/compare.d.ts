export declare function compareRunToReplay(workspaceRoot: string, runId: string): Promise<{
    runId: string;
    mismatches: number;
    details: {
        run: {
            state: string;
            modeId: string | null;
            pipeline: unknown;
            commands: string[];
            patchSummary: unknown;
        };
        replay: {
            ok: boolean | null;
            summary: unknown;
            checks: unknown[];
        };
        diffs: Record<string, unknown>;
    };
}>;
