import type { ModesRegistry } from "../../core/modes.registry.js";
export type AgentDetail = {
    id: string;
    name?: string;
    tags?: string[];
    status?: string;
    isChef?: boolean;
    flow?: Record<string, unknown>;
    runtimePolicy?: Record<string, unknown>;
    lastRuns?: Record<string, unknown>[];
    healthMetrics?: Record<string, unknown>;
};
export declare function getAgentDetail(registry: ModesRegistry, modeId: string): Promise<AgentDetail | null>;
export declare function getAgentRuns(root: string, modeId: string, limit?: number): Record<string, unknown>[];
export declare function getAgentHealth(root: string, modeId: string): Record<string, unknown>;
