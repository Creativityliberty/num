import type { LLMAdapter } from "../llm/adapter.js";
import type { McpToolClient } from "../mcp/client.js";
import { type McpSpawnOptions } from "../mcp/client.js";
export type RunOrchestrationOptions = {
    mcp: McpSpawnOptions | McpToolClient;
    adapter: LLMAdapter;
    task: unknown;
    flow?: unknown;
    modeId?: string;
    maxModelJSONRetries?: number;
    onLog?: (msg: string) => void;
};
type Result = {
    status: "done";
    runId: string;
    sessionId: string;
    bundlePath?: string | undefined;
    git?: unknown;
} | {
    status: "manual";
    runId: string;
    sessionId: string;
    message: string;
    suggestedTools?: string[] | undefined;
} | {
    status: "failed";
    runId?: string | undefined;
    sessionId?: string | undefined;
    error: unknown;
};
export declare function runOrchestration(opts: RunOrchestrationOptions): Promise<Result>;
export {};
//# sourceMappingURL=runner.d.ts.map