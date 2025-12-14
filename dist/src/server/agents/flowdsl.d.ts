export declare function renderTemplate(tpl: string, ctx: any): string;
export declare function normalizeFlowSpec(input: unknown): {
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
export declare function buildJobsFromFlow(spec: any): any;
