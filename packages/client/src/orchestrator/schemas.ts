import { z } from "zod";

export const PlanPayloadSchema = z.object({
  phases: z.array(z.object({ title: z.string(), steps: z.array(z.unknown()) })).min(1),
  acceptanceCriteria: z.array(z.string()).optional().default([]),
  verification: z.array(z.string()).optional().default([]),
  risks: z.array(z.string()).optional().default([]),
  assumptions: z.array(z.string()).optional().default([]),
});

export const RunOutputPayloadSchema = z.object({
  patch: z.string().min(1),
  commands: z.array(z.string()).optional().default([]),
  pr: z.object({ title: z.string().optional(), body: z.string().optional() }).optional(),
  notes: z
    .object({
      assumptions: z.array(z.string()).optional(),
      risks: z.array(z.string()).optional(),
      rollback: z.string().optional(),
    })
    .optional(),
});

export const ReviewOutputPayloadSchema = z.object({
  severity: z.enum(["low", "medium", "high", "blocker"]),
  findings: z.array(z.object({ type: z.string(), message: z.string(), location: z.string().optional() })).optional().default([]),
  recommendedCommands: z.array(z.string()).optional().default([]),
  approval: z.boolean(),
});
