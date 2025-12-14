import { z } from "zod";
export const RuntimeMetricsSchema = z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    costUsd: z.number().nonnegative().optional(),
    fallbackUsed: z.boolean().optional(),
});
