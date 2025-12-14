import type { Policy } from "../core/policy.js";
export type BundleData = {
    meta: {
        sessionId: string;
        createdAt: string;
        workspaceRoot: string;
        modeId: string | null;
    };
    task: unknown;
    plan: unknown;
    runOutput: unknown;
    reviewOutput: unknown;
    execResults: unknown;
    git: {
        branch?: string;
        commitSha?: string;
    } | null;
};
export declare function writeBundle(policy: Policy, sessionId: string, bundle: BundleData): Promise<string>;
