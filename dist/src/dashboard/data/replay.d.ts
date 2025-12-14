type PolicyPublic = {
    allowWrite: boolean;
    allowExec: boolean;
    allowGit: boolean;
    allowedCommands: string[];
};
export declare function replayDryRun(workspaceRoot: string, policy: PolicyPublic, runId: string): Promise<{
    runId: string;
    sessionId: string;
    ok: boolean;
    checks: Array<{
        name: string;
        ok: boolean;
        bad?: string[];
        note?: string;
        message?: string;
        files?: number;
    }>;
    summary: {
        patch?: {
            filesChanged: number;
            insertions: number;
            deletions: number;
        };
    };
    wroteReportPath: string | null;
}>;
export {};
