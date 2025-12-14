import { z } from "zod";
export declare const PackSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    runtimePolicy: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    runtimePolicy?: {
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
    };
    enabled?: boolean;
}, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    version?: string;
    runtimePolicy?: {
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
    };
    enabled?: boolean;
}>;
export type Pack = z.infer<typeof PackSchema>;
