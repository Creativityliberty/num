import type { ModesStore } from "../../core/modes.store.js";
import type { Policy } from "../../core/policy.js";
import { AgentsNextResultSchema } from "../../core/schemas.js";
type Next = ReturnType<typeof AgentsNextResultSchema.parse>;
export declare class AgentsEngine {
    private policy;
    private modes?;
    constructor(opts: {
        policy: Policy;
        modes?: ModesStore;
    });
    plan(input: unknown): Promise<{
        runId: string;
        sessionId: string;
    }>;
    next(input: unknown): Promise<Next>;
    submit(input: unknown): Promise<{
        runId: string;
        jobId: string;
        ok: boolean;
        status: string;
        message: string;
        suggestedTools?: undefined;
    } | {
        runId: string;
        jobId: string;
        ok: boolean;
        status: string;
        message: string;
        suggestedTools: string[];
    } | {
        runId: string;
        jobId: string;
        ok: boolean;
        status: string;
        message?: undefined;
        suggestedTools?: undefined;
    }>;
    mergeDecision(input: unknown): Promise<{
        runId: string;
        ok: boolean;
        status: string;
        message: string;
    } | {
        runId: string;
        ok: boolean;
        status: string;
        message?: undefined;
    }>;
}
export {};
