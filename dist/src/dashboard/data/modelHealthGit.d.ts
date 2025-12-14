export type GitBatchInput = {
    workspaceRoot: string;
    branchPrefix?: string;
    commitMessage?: string;
    createBranch?: boolean;
    commit?: boolean;
    createBundle?: boolean;
    packId?: string;
    packDir?: string;
    changedFiles?: string[];
};
export type GitBatchResult = {
    ok: boolean;
    branchName?: string;
    commitHash?: string;
    bundlePath?: string;
    error?: string;
};
export declare function runGitBatchOps(input: GitBatchInput): GitBatchResult;
