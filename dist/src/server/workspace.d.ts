import { type Policy } from "../core/policy.js";
export type BackupResult = {
    ok: boolean;
    backupPath: string;
    files: string[];
};
export declare function backupFiles(opts: {
    workspaceRoot: string;
    policy?: Policy;
    runId: string;
    files: string[];
}): Promise<BackupResult>;
export type RollbackResult = {
    ok: boolean;
    restoredCount: number;
    restored: string[];
};
export declare function rollbackWorkspace(opts: {
    workspaceRoot: string;
    policy?: Policy;
    runId: string;
}): Promise<RollbackResult>;
export type ApplyPatchResult = {
    applied: boolean;
    dryRun: boolean;
    filesChanged: number;
    insertions: number;
    deletions: number;
    errors: string[];
};
export type ApplyPatchOptions = {
    workspaceRoot: string;
    diff: string;
    dryRun: boolean;
    policy?: Policy;
};
export declare function applyUnifiedPatch(workspaceRootOrOpts: string | ApplyPatchOptions, diff?: string, dryRun?: boolean): ApplyPatchResult;
