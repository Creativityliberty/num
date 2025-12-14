import { z } from "zod";
export declare const PublisherSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    publicKey: z.ZodString;
    trusted: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    trusted?: boolean;
    publicKey?: string;
}, {
    id?: string;
    name?: string;
    trusted?: boolean;
    publicKey?: string;
}>;
export declare const SignedPackBundleSchema: z.ZodObject<{
    bundle: z.ZodObject<{
        format: z.ZodDefault<z.ZodLiteral<"mcp-agents-pack">>;
        version: z.ZodDefault<z.ZodLiteral<"1">>;
        pack: z.ZodObject<{
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
        files: z.ZodDefault<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path?: string;
            content?: string;
        }, {
            path?: string;
            content?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        files?: {
            path?: string;
            content?: string;
        }[];
        version?: "1";
        pack?: {
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
        };
        format?: "mcp-agents-pack";
    }, {
        files?: {
            path?: string;
            content?: string;
        }[];
        version?: "1";
        pack?: {
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
        };
        format?: "mcp-agents-pack";
    }>;
    signature: z.ZodString;
    publisherId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bundle?: {
        files?: {
            path?: string;
            content?: string;
        }[];
        version?: "1";
        pack?: {
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
        };
        format?: "mcp-agents-pack";
    };
    signature?: string;
    publisherId?: string;
}, {
    bundle?: {
        files?: {
            path?: string;
            content?: string;
        }[];
        version?: "1";
        pack?: {
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
        };
        format?: "mcp-agents-pack";
    };
    signature?: string;
    publisherId?: string;
}>;
export declare const MarketplacePackSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodString;
    publisherId: z.ZodString;
    publisherName: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    downloads: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    publisherId?: string;
    publisherName?: string;
    downloads?: number;
}, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    publisherId?: string;
    publisherName?: string;
    downloads?: number;
}>;
export declare const TrustPolicySchema: z.ZodObject<{
    allowUnsigned: z.ZodDefault<z.ZodBoolean>;
    allowUntrusted: z.ZodDefault<z.ZodBoolean>;
    trustedPublishers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        publicKey: z.ZodString;
        trusted: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        trusted?: boolean;
        publicKey?: string;
    }, {
        id?: string;
        name?: string;
        trusted?: boolean;
        publicKey?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    allowUnsigned?: boolean;
    allowUntrusted?: boolean;
    trustedPublishers?: {
        id?: string;
        name?: string;
        trusted?: boolean;
        publicKey?: string;
    }[];
}, {
    allowUnsigned?: boolean;
    allowUntrusted?: boolean;
    trustedPublishers?: {
        id?: string;
        name?: string;
        trusted?: boolean;
        publicKey?: string;
    }[];
}>;
export type Publisher = z.infer<typeof PublisherSchema>;
export type SignedPackBundle = z.infer<typeof SignedPackBundleSchema>;
export type MarketplacePack = z.infer<typeof MarketplacePackSchema>;
export type TrustPolicy = z.infer<typeof TrustPolicySchema>;
