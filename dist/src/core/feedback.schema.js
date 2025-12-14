import { z } from "zod";
export const ModeFeedbackSchema = z.object({
    modeId: z.string().min(1),
    runId: z.string().min(1),
    success: z.boolean(),
    costUsd: z.number().nonnegative().optional(),
    durationMs: z.number().nonnegative().optional(),
    rolledBack: z.boolean().optional(),
    ts: z.string(),
});
export const ModeStatsSchema = z.object({
    modeId: z.string(),
    totalRuns: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    failCount: z.number().int().nonnegative(),
    rollbackCount: z.number().int().nonnegative(),
    successRate: z.number().min(0).max(1),
    rollbackRate: z.number().min(0).max(1),
    avgCostUsd: z.number().nonnegative().optional(),
    avgDurationMs: z.number().nonnegative().optional(),
});
