export type GitOpsInput = {
    operation: "branch" | "commit" | "push" | "pr" | "bundle";
    branchName?: string;
    message?: string;
    remote?: string;
    prTitle?: string;
    prBody?: string;
    bundleId?: string;
};
export type GitOpsResult = {
    ok: boolean;
    operation: string;
    result?: Record<string, unknown>;
    error?: string;
};
export type BatchOpInput = {
    operation: "validate-all" | "simulate-all" | "smoke-all" | "export-all";
    packId?: string;
    sample?: number;
    dryRun?: boolean;
};
export type BatchOpResult = {
    ok: boolean;
    operation: string;
    count: number;
    success: number;
    failed: number;
    duration: number;
    results?: Record<string, unknown>[];
    error?: string;
};
export type ReportInput = {
    type: "smoke" | "health" | "scoring" | "packops";
    range?: string;
    format?: "json" | "html" | "csv";
};
export type ReportResult = {
    ok: boolean;
    type: string;
    format: string;
    size: number;
    path?: string;
    data?: Record<string, unknown>;
    error?: string;
};
export declare function executeGitOps(root: string, input: GitOpsInput): GitOpsResult;
export declare function executeBatchOp(root: string, input: BatchOpInput): BatchOpResult;
export declare function generateReport(root: string, input: ReportInput): ReportResult;
