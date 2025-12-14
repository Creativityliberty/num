import { z } from "zod";
export declare const CatalogAgentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    flow: z.ZodObject<{
        version: z.ZodDefault<z.ZodLiteral<"1">>;
        name: z.ZodOptional<z.ZodString>;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
            goal: z.ZodString;
            expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
            prompt: z.ZodObject<{
                system: z.ZodString;
                user: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                system?: string;
                user?: string;
            }, {
                system?: string;
                user?: string;
            }>;
            outputKey: z.ZodOptional<z.ZodString>;
            runtimePolicy: z.ZodOptional<z.ZodObject<{
                model: z.ZodOptional<z.ZodObject<{
                    preferred: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>>;
                    fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>, "many">>;
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
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }, {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }>, "many">;
        edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
        }, "strip", z.ZodTypeAny, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    flow?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
    enabled?: boolean;
}, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    flow?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
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
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
    enabled?: boolean;
}>;
export declare const CatalogSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodLiteral<"1">>;
    namespace: z.ZodOptional<z.ZodString>;
    agents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        flow: z.ZodObject<{
            version: z.ZodDefault<z.ZodLiteral<"1">>;
            name: z.ZodOptional<z.ZodString>;
            nodes: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
                goal: z.ZodString;
                expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
                prompt: z.ZodObject<{
                    system: z.ZodString;
                    user: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    system?: string;
                    user?: string;
                }, {
                    system?: string;
                    user?: string;
                }>;
                outputKey: z.ZodOptional<z.ZodString>;
                runtimePolicy: z.ZodOptional<z.ZodObject<{
                    model: z.ZodOptional<z.ZodObject<{
                        preferred: z.ZodOptional<z.ZodObject<{
                            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                            model: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }>>;
                        fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                            model: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }>, "many">>;
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
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }, {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }>, "many">;
            edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
            }, "strip", z.ZodTypeAny, {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }, {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        }, {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        }>;
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        tags?: string[];
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        enabled?: boolean;
    }, {
        id?: string;
        name?: string;
        description?: string;
        tags?: string[];
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        enabled?: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    version?: "1";
    agents?: {
        id?: string;
        name?: string;
        description?: string;
        tags?: string[];
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        enabled?: boolean;
    }[];
    namespace?: string;
}, {
    version?: "1";
    agents?: {
        id?: string;
        name?: string;
        description?: string;
        tags?: string[];
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
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
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        enabled?: boolean;
    }[];
    namespace?: string;
}>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type CatalogAgent = z.infer<typeof CatalogAgentSchema>;
