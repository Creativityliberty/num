import { type Policy } from "../core/policy.js";
export type ExecResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
    truncated: boolean;
    command: string;
};
export type RunCommandOptions = {
    cmd: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
    workspaceRoot: string;
};
export declare function runCommand(opts: RunCommandOptions): Promise<ExecResult>;
export declare function runCommandWithPolicy(policy: Policy, opts: {
    cmd: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
}): Promise<ExecResult>;
export declare function parseCommandString(command: string): {
    cmd: string;
    args: string[];
};
export declare function isCommandAllowed(command: string, customAllowlist?: RegExp[]): boolean;
