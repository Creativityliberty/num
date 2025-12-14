import { z } from "zod";

export const ModelRefSchema = z.object({
  provider: z.enum(["openai", "anthropic", "generic"]),
  model: z.string().min(1),
});

export const ModelPolicySchema = z.object({
  preferred: ModelRefSchema.optional(),
  fallbacks: z.array(ModelRefSchema).default([]),
}).partial();

export const BudgetSchema = z.object({
  maxTokens: z.number().int().positive().optional(),
  maxCostUsd: z.number().positive().optional(),
});

export const RateLimitSchema = z.object({
  rpm: z.number().int().positive().optional(),
  tpm: z.number().int().positive().optional(),
});

export const AgentRuntimePolicySchema = z.object({
  model: ModelPolicySchema.optional(),
  budget: BudgetSchema.optional(),
  rateLimit: RateLimitSchema.optional(),
});

export type ModelRef = z.infer<typeof ModelRefSchema>;
export type ModelPolicy = z.infer<typeof ModelPolicySchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type AgentRuntimePolicy = z.infer<typeof AgentRuntimePolicySchema>;
