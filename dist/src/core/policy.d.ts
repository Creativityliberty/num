import { z } from "zod";
declare const ConfirmationTargetSchema: z.ZodEnum<["applyPatch", "exec", "branch", "commit"]>;
export type ConfirmationTarget = z.infer<typeof ConfirmationTargetSchema>;
export declare const PolicySchema: z.ZodObject<{
    workspaceRoot: z.ZodString;
    allowWrite: z.ZodDefault<z.ZodBoolean>;
    allowExec: z.ZodDefault<z.ZodBoolean>;
    allowGit: z.ZodDefault<z.ZodBoolean>;
    maxPatchBytes: z.ZodDefault<z.ZodNumber>;
    maxFilesChanged: z.ZodDefault<z.ZodNumber>;
    allowedCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    exec: z.ZodDefault<z.ZodObject<{
        allowedExecutables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        allowedArgs: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodArray<z.ZodString, "many">, "many">>>;
    }, "strip", z.ZodTypeAny, {
        allowedExecutables?: string[];
        allowedArgs?: Record<string, string[][]>;
    }, {
        allowedExecutables?: string[];
        allowedArgs?: Record<string, string[][]>;
    }>>;
    allowedWritePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    blockedWritePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    requireConfirmationFor: z.ZodDefault<z.ZodArray<z.ZodEnum<["applyPatch", "exec", "branch", "commit"]>, "many">>;
    /** Rollback cooldown (seconds). Used by dashboard to avoid spam/double-click. Default: 300s (5 min) */
    rollbackCooldownSeconds: z.ZodDefault<z.ZodNumber>;
    git: z.ZodDefault<z.ZodObject<{
        allowedBranchPrefixes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        allowCommit: z.ZodDefault<z.ZodBoolean>;
        commitMessagePattern: z.ZodDefault<z.ZodString>;
        allowPush: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        allowedBranchPrefixes?: string[];
        allowCommit?: boolean;
        commitMessagePattern?: string;
        allowPush?: boolean;
    }, {
        allowedBranchPrefixes?: string[];
        allowCommit?: boolean;
        commitMessagePattern?: string;
        allowPush?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    exec?: {
        allowedExecutables?: string[];
        allowedArgs?: Record<string, string[][]>;
    };
    workspaceRoot?: string;
    allowWrite?: boolean;
    allowExec?: boolean;
    allowGit?: boolean;
    maxPatchBytes?: number;
    maxFilesChanged?: number;
    allowedCommands?: string[];
    allowedWritePaths?: string[];
    blockedWritePaths?: string[];
    requireConfirmationFor?: ("applyPatch" | "exec" | "branch" | "commit")[];
    rollbackCooldownSeconds?: number;
    git?: {
        allowedBranchPrefixes?: string[];
        allowCommit?: boolean;
        commitMessagePattern?: string;
        allowPush?: boolean;
    };
}, {
    exec?: {
        allowedExecutables?: string[];
        allowedArgs?: Record<string, string[][]>;
    };
    workspaceRoot?: string;
    allowWrite?: boolean;
    allowExec?: boolean;
    allowGit?: boolean;
    maxPatchBytes?: number;
    maxFilesChanged?: number;
    allowedCommands?: string[];
    allowedWritePaths?: string[];
    blockedWritePaths?: string[];
    requireConfirmationFor?: ("applyPatch" | "exec" | "branch" | "commit")[];
    rollbackCooldownSeconds?: number;
    git?: {
        allowedBranchPrefixes?: string[];
        allowCommit?: boolean;
        commitMessagePattern?: string;
        allowPush?: boolean;
    };
}>;
export type Policy = z.infer<typeof PolicySchema>;
export declare function loadPolicy(policyPath: string): Promise<Policy>;
export declare function defaultPolicy(): Policy;
/**
 * v11.1 allowlist check for exec.
 * Priority:
 *   1) policy.exec.allowedExecutables + policy.exec.allowedArgs (preferred)
 *   2) policy.allowedCommands (legacy fallback)
 */
export declare function isExecAllowed(policy: Policy, cmd: string, args: string[]): {
    ok: boolean;
    reason?: string;
};
/**
 * v11.2 - Check if confirmation is required for an action
 */
export declare function requiresConfirmation(policy: Policy, what: ConfirmationTarget): boolean;
/**
 * v11.2 - Check if a file path is allowed for writing
 */
export declare function isWritePathAllowed(policy: Policy, filePath: string): {
    ok: boolean;
    reason?: string;
};
export {};
