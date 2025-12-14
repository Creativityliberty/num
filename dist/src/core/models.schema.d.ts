import { z } from "zod";
export declare const ModelRefSchema: z.ZodObject<{
    provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
    model: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider?: "openai" | "anthropic" | "generic";
    model?: string;
}, {
    provider?: "openai" | "anthropic" | "generic";
    model?: string;
}>;
export declare const ModelPolicySchema: z.ZodObject<{
    preferred: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
        model: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }, {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }>>>;
    fallbacks: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
        model: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }, {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    preferred?: {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    };
    fallbacks?: {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }[];
}, {
    preferred?: {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    };
    fallbacks?: {
        provider?: "openai" | "anthropic" | "generic";
        model?: string;
    }[];
}>;
export declare const BudgetSchema: z.ZodObject<{
    maxTokens: z.ZodOptional<z.ZodNumber>;
    maxCostUsd: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxTokens?: number;
    maxCostUsd?: number;
}, {
    maxTokens?: number;
    maxCostUsd?: number;
}>;
export declare const RateLimitSchema: z.ZodObject<{
    rpm: z.ZodOptional<z.ZodNumber>;
    tpm: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    rpm?: number;
    tpm?: number;
}, {
    rpm?: number;
    tpm?: number;
}>;
export declare const AgentRuntimePolicySchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodObject<{
        preferred: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }>>>;
        fallbacks: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    }, {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    }>>;
    budget: z.ZodOptional<z.ZodObject<{
        maxTokens: z.ZodOptional<z.ZodNumber>;
        maxCostUsd: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxTokens?: number;
        maxCostUsd?: number;
    }, {
        maxTokens?: number;
        maxCostUsd?: number;
    }>>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        rpm: z.ZodOptional<z.ZodNumber>;
        tpm: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        rpm?: number;
        tpm?: number;
    }, {
        rpm?: number;
        tpm?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    model?: {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    };
    budget?: {
        maxTokens?: number;
        maxCostUsd?: number;
    };
    rateLimit?: {
        rpm?: number;
        tpm?: number;
    };
}, {
    model?: {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    };
    budget?: {
        maxTokens?: number;
        maxCostUsd?: number;
    };
    rateLimit?: {
        rpm?: number;
        tpm?: number;
    };
}>;
export type ModelRef = z.infer<typeof ModelRefSchema>;
export type ModelPolicy = z.infer<typeof ModelPolicySchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type AgentRuntimePolicy = z.infer<typeof AgentRuntimePolicySchema>;
