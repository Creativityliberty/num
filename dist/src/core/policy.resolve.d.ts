import type { AgentRuntimePolicy } from "./models.schema.js";
export declare function resolveRuntimePolicy(opts: {
    node?: AgentRuntimePolicy;
    mode?: AgentRuntimePolicy;
    pack?: AgentRuntimePolicy;
    defaults?: AgentRuntimePolicy;
}): AgentRuntimePolicy;
