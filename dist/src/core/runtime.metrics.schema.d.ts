import { z } from "zod";
export declare const RuntimeMetricsSchema: z.ZodObject<{
    provider: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    inputTokens: z.ZodOptional<z.ZodNumber>;
    outputTokens: z.ZodOptional<z.ZodNumber>;
    totalTokens: z.ZodOptional<z.ZodNumber>;
    costUsd: z.ZodOptional<z.ZodNumber>;
    fallbackUsed: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
    totalTokens?: number;
    fallbackUsed?: boolean;
}, {
    provider?: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
    totalTokens?: number;
    fallbackUsed?: boolean;
}>;
export type RuntimeMetrics = z.infer<typeof RuntimeMetricsSchema>;
