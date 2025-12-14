export declare function listReplays(workspaceRoot: string): Promise<{
    runId: string;
    ok: boolean;
    updatedAt: string;
}[]>;
export declare function loadReplay(workspaceRoot: string, runId: string): Promise<unknown>;
export declare function downloadReplayJSON(workspaceRoot: string, runId: string): Promise<unknown>;
