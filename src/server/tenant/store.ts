import fs from "node:fs/promises";
import path from "node:path";
import { ProjectSchema, TenantSchema, type Project, type Tenant } from "../../core/tenant.schema.js";
import type { TenantDailyStats } from "./quota.js";

export class TenantStore {
  constructor(private root: string) {}

  private tenantsDir() {
    return path.join(this.root, ".mcp", "tenants");
  }

  private tenantFile(tenantId: string) {
    return path.join(this.tenantsDir(), tenantId, "tenant.json");
  }

  private projectsFile(tenantId: string) {
    return path.join(this.tenantsDir(), tenantId, "projects.json");
  }

  private statsFile(tenantId: string, date: string) {
    return path.join(this.tenantsDir(), tenantId, "stats", `${date}.json`);
  }

  async createTenant(tenant: Tenant): Promise<void> {
    const dir = path.join(this.tenantsDir(), tenant.id);
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(path.join(dir, "runs"), { recursive: true });
    await fs.mkdir(path.join(dir, "stats"), { recursive: true });
    await fs.writeFile(this.tenantFile(tenant.id), JSON.stringify(TenantSchema.parse(tenant), null, 2));
    await fs.writeFile(this.projectsFile(tenant.id), JSON.stringify([], null, 2));
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const raw = await fs.readFile(this.tenantFile(tenantId), "utf-8");
      return TenantSchema.parse(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  async listTenants(): Promise<Tenant[]> {
    try {
      const dirs = await fs.readdir(this.tenantsDir());
      const tenants: Tenant[] = [];
      for (const d of dirs) {
        const t = await this.getTenant(d);
        if (t) tenants.push(t);
      }
      return tenants;
    } catch {
      return [];
    }
  }

  async addProject(project: Project): Promise<void> {
    const file = this.projectsFile(project.tenantId);
    let projects: Project[] = [];
    try {
      projects = JSON.parse(await fs.readFile(file, "utf-8"));
    } catch {
      // No projects yet
    }
    projects.push(ProjectSchema.parse(project));
    await fs.writeFile(file, JSON.stringify(projects, null, 2));
  }

  async listProjects(tenantId: string): Promise<Project[]> {
    try {
      const raw = await fs.readFile(this.projectsFile(tenantId), "utf-8");
      return JSON.parse(raw).map((p: unknown) => ProjectSchema.parse(p));
    } catch {
      return [];
    }
  }

  async getDailyStats(tenantId: string, date?: string): Promise<TenantDailyStats> {
    const d = date ?? new Date().toISOString().slice(0, 10);
    try {
      const raw = await fs.readFile(this.statsFile(tenantId, d), "utf-8");
      return JSON.parse(raw);
    } catch {
      return { runs: 0, costUsd: 0 };
    }
  }

  async incrementDailyStats(tenantId: string, delta: { runs?: number; costUsd?: number }): Promise<void> {
    const d = new Date().toISOString().slice(0, 10);
    const stats = await this.getDailyStats(tenantId, d);
    stats.runs += delta.runs ?? 0;
    stats.costUsd += delta.costUsd ?? 0;
    await fs.mkdir(path.dirname(this.statsFile(tenantId, d)), { recursive: true });
    await fs.writeFile(this.statsFile(tenantId, d), JSON.stringify(stats, null, 2));
  }

  tenantRunsDir(tenantId: string): string {
    return path.join(this.tenantsDir(), tenantId, "runs");
  }

  tenantPacksDir(tenantId: string): string {
    return path.join(this.tenantsDir(), tenantId, "packs");
  }

  tenantFeedbackFile(tenantId: string): string {
    return path.join(this.tenantsDir(), tenantId, "feedback.jsonl");
  }
}
