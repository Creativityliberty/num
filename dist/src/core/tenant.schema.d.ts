import { z } from "zod";
export declare const TenantQuotasSchema: z.ZodObject<{
    maxRunsPerDay: z.ZodNumber;
    maxCostUsdPerDay: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    maxRunsPerDay?: number;
    maxCostUsdPerDay?: number;
}, {
    maxRunsPerDay?: number;
    maxCostUsdPerDay?: number;
}>;
export declare const TenantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    quotas: z.ZodObject<{
        maxRunsPerDay: z.ZodNumber;
        maxCostUsdPerDay: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        maxRunsPerDay?: number;
        maxCostUsdPerDay?: number;
    }, {
        maxRunsPerDay?: number;
        maxCostUsdPerDay?: number;
    }>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    createdAt?: string;
    enabled?: boolean;
    quotas?: {
        maxRunsPerDay?: number;
        maxCostUsdPerDay?: number;
    };
}, {
    id?: string;
    name?: string;
    createdAt?: string;
    enabled?: boolean;
    quotas?: {
        maxRunsPerDay?: number;
        maxCostUsdPerDay?: number;
    };
}>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    enabled?: boolean;
    tenantId?: string;
}, {
    id?: string;
    name?: string;
    enabled?: boolean;
    tenantId?: string;
}>;
export declare const TenantContextSchema: z.ZodObject<{
    tenantId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    projectId?: string;
}, {
    tenantId?: string;
    projectId?: string;
}>;
export type TenantQuotas = z.infer<typeof TenantQuotasSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type TenantContext = z.infer<typeof TenantContextSchema>;
