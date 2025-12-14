type ModelRef = {
    provider: string;
    model: string;
};
export type ApplySuggestionInput = {
    packId: string;
    packDir: string;
    modesDir?: string;
    applyTarget: "packDefaults" | "mode";
    modeId?: string;
    from: ModelRef;
    to: ModelRef;
    dryRun?: boolean;
};
export type ApplySuggestionResult = {
    ok: boolean;
    dryRun: boolean;
    target: "packDefaults" | "mode";
    written?: string[];
    changes: Array<{
        file: string;
        before: unknown;
        after: unknown;
    }>;
    reportPath?: string;
};
export declare function applyModelFallbackSuggestion(root: string, input: ApplySuggestionInput): ApplySuggestionResult;
export {};
