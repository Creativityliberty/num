import type { Policy } from "../../core/policy.js";
import { OrchestrateRunRecordSchema } from "../../core/schemas.js";
export declare function newRunId(): string;
export declare function ensureRunsDir(policy: Policy): Promise<void>;
export declare function runPath(policy: Policy, runId: string): string;
export declare function saveRun(policy: Policy, run: unknown): Promise<void>;
export declare function loadRun(policy: Policy, runId: string): Promise<ReturnType<typeof OrchestrateRunRecordSchema.parse>>;
export declare function tryLoadRun(policy: Policy, runId: string): Promise<ReturnType<typeof OrchestrateRunRecordSchema.parse> | null>;
export declare function appendTelemetry(policy: Policy, runId: string, event: unknown): Promise<{
    ok: boolean;
    count: number;
}>;
