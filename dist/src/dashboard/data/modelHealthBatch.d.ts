type ModelRef = {
    provider: string;
    model: string;
};
export type BatchApplyInput = {
    range?: string;
    minCalls?: number;
    topN?: number;
    dryRun?: boolean;
    packId: string;
    packDir: string;
    modesDir?: string;
    applyTarget: "packDefaults" | "mode";
    modeId?: string;
    provider?: string;
};
export type BatchApplyItem = {
    from: ModelRef;
    to: ModelRef;
    reason: string;
    confidence: "low" | "medium" | "high";
    fromScore: number;
    toScore: number;
};
export type BatchApplyResult = {
    ok: boolean;
    dryRun: boolean;
    selected: BatchApplyItem[];
    applied: Array<{
        idx: number;
        ok: boolean;
        error?: string;
        written?: string[];
    }>;
    reportPath?: string;
};
export declare function batchSelectSuggestions(root: string, input: BatchApplyInput): BatchApplyItem[];
export declare function runBatchApply(root: string, input: BatchApplyInput): BatchApplyResult;
export {};
