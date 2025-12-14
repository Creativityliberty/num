import { z } from "zod";
export declare const ModeFeedbackSchema: z.ZodObject<{
    modeId: z.ZodString;
    runId: z.ZodString;
    success: z.ZodBoolean;
    costUsd: z.ZodOptional<z.ZodNumber>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    rolledBack: z.ZodOptional<z.ZodBoolean>;
    ts: z.ZodString;
}, "strip", z.ZodTypeAny, {
    costUsd?: number;
    ts?: string;
    runId?: string;
    modeId?: string;
    durationMs?: number;
    success?: boolean;
    rolledBack?: boolean;
}, {
    costUsd?: number;
    ts?: string;
    runId?: string;
    modeId?: string;
    durationMs?: number;
    success?: boolean;
    rolledBack?: boolean;
}>;
export type ModeFeedback = z.infer<typeof ModeFeedbackSchema>;
export declare const ModeStatsSchema: z.ZodObject<{
    modeId: z.ZodString;
    totalRuns: z.ZodNumber;
    successCount: z.ZodNumber;
    failCount: z.ZodNumber;
    rollbackCount: z.ZodNumber;
    successRate: z.ZodNumber;
    rollbackRate: z.ZodNumber;
    avgCostUsd: z.ZodOptional<z.ZodNumber>;
    avgDurationMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    modeId?: string;
    successRate?: number;
    totalRuns?: number;
    successCount?: number;
    failCount?: number;
    rollbackCount?: number;
    rollbackRate?: number;
    avgCostUsd?: number;
    avgDurationMs?: number;
}, {
    modeId?: string;
    successRate?: number;
    totalRuns?: number;
    successCount?: number;
    failCount?: number;
    rollbackCount?: number;
    rollbackRate?: number;
    avgCostUsd?: number;
    avgDurationMs?: number;
}>;
export type ModeStats = z.infer<typeof ModeStatsSchema>;
