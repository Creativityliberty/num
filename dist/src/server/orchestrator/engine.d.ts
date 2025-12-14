import { type Policy } from "../../core/policy.js";
import type { ModeRegistry } from "../../core/registry.js";
import type { EventBus } from "../../obs/events.js";
type NextStep = {
    kind: "llm";
    stepId: "plan" | "run" | "review";
    tool: "modes.planPrompt" | "modes.runPrompt" | "modes.reviewPrompt";
    promptPack: unknown;
    expected: "PlanJSON" | "RunJSON" | "ReviewJSON";
} | {
    kind: "manual";
    message: string;
    suggestedTools?: string[];
} | {
    kind: "done";
    message: string;
};
export declare function orchestrateStart(deps: {
    policy: Policy;
    bus: EventBus;
    registry: ModeRegistry;
}, raw: unknown): Promise<{
    sessionId: string;
    runId: string;
    state: string;
    error: {
        code: string;
        message: string;
    };
    nextStep: NextStep;
    selectedMode?: undefined;
} | {
    sessionId: string;
    runId: string;
    state: unknown;
    selectedMode: unknown;
    nextStep: NextStep;
    error?: undefined;
}>;
export declare function orchestrateContinue(deps: {
    policy: Policy;
    bus: EventBus;
    registry: ModeRegistry;
}, raw: unknown): Promise<{
    sessionId: string;
    runId: unknown;
    state: unknown;
    bundlePath: unknown;
    git: unknown;
    nextStep: NextStep;
} | {
    sessionId: string;
    runId: unknown;
    state: unknown;
    error: unknown;
    nextStep: NextStep;
} | {
    sessionId: string;
    runId: unknown;
    state: unknown;
    nextStep: NextStep;
    error?: undefined;
}>;
export declare function orchestrateStatus(deps: {
    policy: Policy;
}, runId: string): Promise<{
    runId: string;
    sessionId: string;
    state: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
    selectedMode: {
        id?: string;
        name?: string;
        confidence?: number;
    };
    bundlePath: string;
    git: {
        branch?: string;
        commitSha?: string;
    };
    fixIterations: number;
    updatedAt: string;
}>;
export declare function orchestrateCancel(deps: {
    policy: Policy;
}, runId: string): Promise<Record<string, unknown>>;
export {};
