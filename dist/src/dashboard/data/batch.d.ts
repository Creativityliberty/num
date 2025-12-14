type PolicyPublic = {
    allowWrite: boolean;
    allowExec: boolean;
    allowGit: boolean;
    allowedCommands: string[];
};
export declare function replayLatestDoneRuns(workspaceRoot: string, policy: PolicyPublic, limit: number): Promise<{
    summary: {
        total: number;
        ok: number;
        fail: number;
    };
    results: {
        runId: string;
        ok: boolean;
        wroteReportPath?: string;
        error?: string;
    }[];
}>;
export {};
