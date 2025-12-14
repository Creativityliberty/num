import { z } from "zod";
export const TenantQuotasSchema = z.object({
    maxRunsPerDay: z.number().int().positive(),
    maxCostUsdPerDay: z.number().positive(),
});
export const TenantSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    quotas: TenantQuotasSchema,
    enabled: z.boolean().default(true),
    createdAt: z.string().optional(),
});
export const ProjectSchema = z.object({
    id: z.string().min(1),
    tenantId: z.string().min(1),
    name: z.string().min(1),
    enabled: z.boolean().default(true),
});
export const TenantContextSchema = z.object({
    tenantId: z.string().min(1),
    projectId: z.string().optional(),
});
