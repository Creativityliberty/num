export class QuotaExceededError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "QuotaExceededError";
    }
}
export function checkQuota(tenant, statsToday) {
    if (statsToday.runs >= tenant.quotas.maxRunsPerDay) {
        throw new QuotaExceededError("TENANT_QUOTA_RUNS_EXCEEDED", `Tenant ${tenant.id} exceeded daily runs quota (${statsToday.runs}/${tenant.quotas.maxRunsPerDay})`);
    }
    if (statsToday.costUsd >= tenant.quotas.maxCostUsdPerDay) {
        throw new QuotaExceededError("TENANT_QUOTA_COST_EXCEEDED", `Tenant ${tenant.id} exceeded daily cost quota ($${statsToday.costUsd.toFixed(2)}/$${tenant.quotas.maxCostUsdPerDay})`);
    }
}
