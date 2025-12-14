import type { Policy } from "../core/policy.js";
import { type BackupResult } from "./workspace.js";
export type PipelineResult = {
    apply: {
        applied: boolean;
        dryRun: boolean;
        filesChanged: number;
        insertions: number;
        deletions: number;
        errors: string[];
    };
    exec: Array<{
        command: string;
        exitCode: number;
        stdout: string;
        stderr: string;
        durationMs: number;
    }>;
    success: boolean;
    failedAt: string | null;
    runId?: string;
    backup?: BackupResult;
    rolledBack?: boolean;
};
export declare function applyAndVerify(opts: {
    policy: Policy;
    diff: string;
    commands: string[];
    dryRun: boolean;
    timeoutMs: number;
    runId?: string;
}): Promise<PipelineResult>;
