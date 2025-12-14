import { z } from "zod";
import type { Policy } from "../core/policy.js";
export declare function assertGitAllowed(policy: Policy): void;
export declare const GitBranchNameSchema: z.ZodString;
export declare function assertBranchAllowed(policy: Policy, name: string): void;
export declare function assertCommitMessageAllowed(policy: Policy, msg: string): void;
export declare function gitStatus(policy: Policy): Promise<{
    branch: string | null;
    porcelain: string;
}>;
export declare function gitDiff(policy: Policy, staged: boolean, paths?: string[]): Promise<string>;
export declare function gitLog(policy: Policy, limit: number): Promise<string>;
export declare function gitCreateBranch(policy: Policy, name: string): Promise<void>;
export declare function gitCommit(policy: Policy, message: string, addAll: boolean, dryRun: boolean): Promise<string>;
