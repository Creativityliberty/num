import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkQuota, QuotaExceededError } from "../src/server/tenant/quota.js";
import { TenantStore } from "../src/server/tenant/store.js";

describe("14.0 tenant & quota", () => {
  it("creates and retrieves tenant", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-tenant-"));
    const store = new TenantStore(tmp);

    await store.createTenant({
      id: "acme",
      name: "Acme Corp",
      quotas: { maxRunsPerDay: 100, maxCostUsdPerDay: 50 },
      enabled: true,
    });

    const tenant = await store.getTenant("acme");
    expect(tenant).not.toBeNull();
    expect(tenant?.name).toBe("Acme Corp");
    expect(tenant?.quotas.maxRunsPerDay).toBe(100);
  });

  it("lists tenants", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-tenant-"));
    const store = new TenantStore(tmp);

    await store.createTenant({ id: "t1", name: "Tenant 1", quotas: { maxRunsPerDay: 10, maxCostUsdPerDay: 5 }, enabled: true });
    await store.createTenant({ id: "t2", name: "Tenant 2", quotas: { maxRunsPerDay: 20, maxCostUsdPerDay: 10 }, enabled: true });

    const tenants = await store.listTenants();
    expect(tenants.length).toBe(2);
  });

  it("manages projects", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-tenant-"));
    const store = new TenantStore(tmp);

    await store.createTenant({ id: "acme", name: "Acme", quotas: { maxRunsPerDay: 100, maxCostUsdPerDay: 50 }, enabled: true });
    await store.addProject({ id: "backend", tenantId: "acme", name: "Backend API", enabled: true });
    await store.addProject({ id: "frontend", tenantId: "acme", name: "Frontend App", enabled: true });

    const projects = await store.listProjects("acme");
    expect(projects.length).toBe(2);
    expect(projects[0]?.name).toBe("Backend API");
  });

  it("tracks daily stats", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-tenant-"));
    const store = new TenantStore(tmp);

    await store.createTenant({ id: "acme", name: "Acme", quotas: { maxRunsPerDay: 100, maxCostUsdPerDay: 50 }, enabled: true });

    await store.incrementDailyStats("acme", { runs: 1, costUsd: 0.5 });
    await store.incrementDailyStats("acme", { runs: 1, costUsd: 1.0 });

    const stats = await store.getDailyStats("acme");
    expect(stats.runs).toBe(2);
    expect(stats.costUsd).toBe(1.5);
  });

  it("checkQuota throws on runs exceeded", () => {
    const tenant = { id: "t", name: "T", quotas: { maxRunsPerDay: 10, maxCostUsdPerDay: 100 }, enabled: true };
    expect(() => checkQuota(tenant, { runs: 10, costUsd: 5 })).toThrow(QuotaExceededError);
    try {
      checkQuota(tenant, { runs: 10, costUsd: 5 });
    } catch (e) {
      expect((e as QuotaExceededError).code).toBe("TENANT_QUOTA_RUNS_EXCEEDED");
    }
  });

  it("checkQuota throws on cost exceeded", () => {
    const tenant = { id: "t", name: "T", quotas: { maxRunsPerDay: 100, maxCostUsdPerDay: 10 }, enabled: true };
    expect(() => checkQuota(tenant, { runs: 5, costUsd: 10 })).toThrow(QuotaExceededError);
    try {
      checkQuota(tenant, { runs: 5, costUsd: 10 });
    } catch (e) {
      expect((e as QuotaExceededError).code).toBe("TENANT_QUOTA_COST_EXCEEDED");
    }
  });

  it("checkQuota passes when under limits", () => {
    const tenant = { id: "t", name: "T", quotas: { maxRunsPerDay: 100, maxCostUsdPerDay: 50 }, enabled: true };
    expect(() => checkQuota(tenant, { runs: 50, costUsd: 25 })).not.toThrow();
  });
});
