export type PatchStats = {
    valid: boolean;
    filesChanged: number;
    insertions: number;
    deletions: number;
    files: string[];
    errors: string[];
};
export declare function parsePatchStats(diff: string): PatchStats;
export declare function validatePatchSafety(diff: string, workspaceRoot: string, opts?: {
    maxBytes?: number;
    maxFiles?: number;
}): {
    safe: boolean;
    errors: string[];
};
