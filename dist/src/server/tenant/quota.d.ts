import type { Tenant } from "../../core/tenant.schema.js";
export interface TenantDailyStats {
    runs: number;
    costUsd: number;
}
export declare class QuotaExceededError extends Error {
    code: "TENANT_QUOTA_RUNS_EXCEEDED" | "TENANT_QUOTA_COST_EXCEEDED";
    constructor(code: "TENANT_QUOTA_RUNS_EXCEEDED" | "TENANT_QUOTA_COST_EXCEEDED", message: string);
}
export declare function checkQuota(tenant: Tenant, statsToday: TenantDailyStats): void;
