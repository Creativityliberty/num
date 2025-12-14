import type { PlanResult, TaskEnvelope, UniversalMode } from "./schemas.js";
export declare function buildDeterministicPlan(opts: {
    sessionId: string;
    task: TaskEnvelope;
    mode?: UniversalMode;
    style: "plan" | "checklist";
    depth: 1 | 2 | 3;
    selectedModeMeta?: {
        id: string;
        name: string;
        confidence?: number;
    };
}): PlanResult;
