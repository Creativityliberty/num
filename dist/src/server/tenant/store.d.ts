import { type Project, type Tenant } from "../../core/tenant.schema.js";
import type { TenantDailyStats } from "./quota.js";
export declare class TenantStore {
    private root;
    constructor(root: string);
    private tenantsDir;
    private tenantFile;
    private projectsFile;
    private statsFile;
    createTenant(tenant: Tenant): Promise<void>;
    getTenant(tenantId: string): Promise<Tenant | null>;
    listTenants(): Promise<Tenant[]>;
    addProject(project: Project): Promise<void>;
    listProjects(tenantId: string): Promise<Project[]>;
    getDailyStats(tenantId: string, date?: string): Promise<TenantDailyStats>;
    incrementDailyStats(tenantId: string, delta: {
        runs?: number;
        costUsd?: number;
    }): Promise<void>;
    tenantRunsDir(tenantId: string): string;
    tenantPacksDir(tenantId: string): string;
    tenantFeedbackFile(tenantId: string): string;
}
