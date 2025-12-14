import type { Tenant } from "../../core/tenant.schema.js";

export interface TenantDailyStats {
  runs: number;
  costUsd: number;
}

export class QuotaExceededError extends Error {
  constructor(
    public code: "TENANT_QUOTA_RUNS_EXCEEDED" | "TENANT_QUOTA_COST_EXCEEDED",
    message: string
  ) {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export function checkQuota(tenant: Tenant, statsToday: TenantDailyStats): void {
  if (statsToday.runs >= tenant.quotas.maxRunsPerDay) {
    throw new QuotaExceededError(
      "TENANT_QUOTA_RUNS_EXCEEDED",
      `Tenant ${tenant.id} exceeded daily runs quota (${statsToday.runs}/${tenant.quotas.maxRunsPerDay})`
    );
  }
  if (statsToday.costUsd >= tenant.quotas.maxCostUsdPerDay) {
    throw new QuotaExceededError(
      "TENANT_QUOTA_COST_EXCEEDED",
      `Tenant ${tenant.id} exceeded daily cost quota ($${statsToday.costUsd.toFixed(2)}/$${tenant.quotas.maxCostUsdPerDay})`
    );
  }
}
