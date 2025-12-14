import { z } from 'zod';
export declare const SharedStoreSchema: z.ZodObject<{
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodString;
        id: z.ZodString;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        goal?: string;
        context?: string;
        createdAt?: Date;
    }, {
        id?: string;
        goal?: string;
        context?: string;
        createdAt?: Date;
    }>;
    artifacts: z.ZodObject<{
        plan: z.ZodOptional<z.ZodAny>;
        patchCandidates: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        chosenCandidateId: z.ZodOptional<z.ZodString>;
        review: z.ZodOptional<z.ZodAny>;
        security: z.ZodOptional<z.ZodAny>;
        testResults: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        plan?: any;
        security?: any;
        review?: any;
        chosenCandidateId?: string;
        patchCandidates?: any[];
        testResults?: any;
    }, {
        plan?: any;
        security?: any;
        review?: any;
        chosenCandidateId?: string;
        patchCandidates?: any[];
        testResults?: any;
    }>;
    telemetry: z.ZodObject<{
        calls: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            provider: z.ZodString;
            model: z.ZodString;
            status: z.ZodEnum<["success", "failed", "timeout"]>;
            latency: z.ZodNumber;
            tokens: z.ZodObject<{
                input: z.ZodNumber;
                output: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                input?: number;
                output?: number;
            }, {
                input?: number;
                output?: number;
            }>;
            timestamp: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }, {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        calls?: {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }[];
    }, {
        calls?: {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }[];
    }>;
    policySnapshot: z.ZodObject<{
        allowedTools: z.ZodArray<z.ZodString, "many">;
        blockedTools: z.ZodArray<z.ZodString, "many">;
        requiresConfirmation: z.ZodBoolean;
        maxTokensPerCall: z.ZodNumber;
        timeout: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout?: number;
        allowedTools?: string[];
        blockedTools?: string[];
        requiresConfirmation?: boolean;
        maxTokensPerCall?: number;
    }, {
        timeout?: number;
        allowedTools?: string[];
        blockedTools?: string[];
        requiresConfirmation?: boolean;
        maxTokensPerCall?: number;
    }>;
    state: z.ZodObject<{
        currentNodeId: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["pending", "running", "completed", "failed", "blocked"]>;
        completedNodes: z.ZodArray<z.ZodString, "many">;
        failedNodes: z.ZodArray<z.ZodString, "many">;
        blockedNodes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "running" | "failed" | "completed" | "blocked";
        currentNodeId?: string;
        completedNodes?: string[];
        failedNodes?: string[];
        blockedNodes?: string[];
    }, {
        status?: "pending" | "running" | "failed" | "completed" | "blocked";
        currentNodeId?: string;
        completedNodes?: string[];
        failedNodes?: string[];
        blockedNodes?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    task?: {
        id?: string;
        goal?: string;
        context?: string;
        createdAt?: Date;
    };
    state?: {
        status?: "pending" | "running" | "failed" | "completed" | "blocked";
        currentNodeId?: string;
        completedNodes?: string[];
        failedNodes?: string[];
        blockedNodes?: string[];
    };
    artifacts?: {
        plan?: any;
        security?: any;
        review?: any;
        chosenCandidateId?: string;
        patchCandidates?: any[];
        testResults?: any;
    };
    telemetry?: {
        calls?: {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }[];
    };
    policySnapshot?: {
        timeout?: number;
        allowedTools?: string[];
        blockedTools?: string[];
        requiresConfirmation?: boolean;
        maxTokensPerCall?: number;
    };
}, {
    task?: {
        id?: string;
        goal?: string;
        context?: string;
        createdAt?: Date;
    };
    state?: {
        status?: "pending" | "running" | "failed" | "completed" | "blocked";
        currentNodeId?: string;
        completedNodes?: string[];
        failedNodes?: string[];
        blockedNodes?: string[];
    };
    artifacts?: {
        plan?: any;
        security?: any;
        review?: any;
        chosenCandidateId?: string;
        patchCandidates?: any[];
        testResults?: any;
    };
    telemetry?: {
        calls?: {
            status?: "failed" | "success" | "timeout";
            provider?: string;
            model?: string;
            nodeId?: string;
            timestamp?: Date;
            latency?: number;
            tokens?: {
                input?: number;
                output?: number;
            };
        }[];
    };
    policySnapshot?: {
        timeout?: number;
        allowedTools?: string[];
        blockedTools?: string[];
        requiresConfirmation?: boolean;
        maxTokensPerCall?: number;
    };
}>;
export type SharedStore = z.infer<typeof SharedStoreSchema>;
export declare class Store {
    private data;
    constructor(initialData: Partial<SharedStore>);
    get(): SharedStore;
    getArtifact(key: keyof SharedStore['artifacts']): any;
    getState(): {
        status?: "pending" | "running" | "failed" | "completed" | "blocked";
        currentNodeId?: string;
        completedNodes?: string[];
        failedNodes?: string[];
        blockedNodes?: string[];
    };
    setArtifact(key: keyof SharedStore['artifacts'], value: any): void;
    addTelemetry(call: SharedStore['telemetry']['calls'][0]): void;
    updateState(updates: Partial<SharedStore['state']>): void;
    markNodeCompleted(nodeId: string): void;
    markNodeFailed(nodeId: string): void;
    markNodeBlocked(nodeId: string): void;
    validate(): {
        valid: boolean;
        errors: string[];
    };
}
