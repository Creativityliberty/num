import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: "success" | "failure";
  details?: Record<string, unknown>;
};

export type RBACRole = {
  name: string;
  permissions: string[];
  description?: string;
};

export type RBACUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

export class AuditLogger {
  private root: string;

  constructor(root: string) {
    this.root = root;
  }

  log(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const auditDir = path.join(this.root, ".mcp", "audit");
    if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

    const auditPath = path.join(auditDir, `${auditEntry.timestamp.split("T")[0]}.jsonl`);
    fs.appendFileSync(auditPath, JSON.stringify(auditEntry) + "\n");

    return auditEntry;
  }

  getLogs(days: number = 7): AuditLogEntry[] {
    const auditDir = path.join(this.root, ".mcp", "audit");
    if (!fs.existsSync(auditDir)) return [];

    const logs: AuditLogEntry[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const files = fs.readdirSync(auditDir).filter((f) => f.endsWith(".jsonl"));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(auditDir, file), "utf-8");
        const lines = content.trim().split("\n");
        for (const line of lines) {
          if (line) {
            const entry = JSON.parse(line) as AuditLogEntry;
            if (new Date(entry.timestamp) >= cutoffDate) {
              logs.push(entry);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export class RBACManager {
  private root: string;
  private roles: Map<string, RBACRole> = new Map();
  private users: Map<string, RBACUser> = new Map();

  constructor(root: string) {
    this.root = root;
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    this.roles.set("admin", {
      name: "admin",
      permissions: ["*"],
      description: "Administrator with full access",
    });
    this.roles.set("editor", {
      name: "editor",
      permissions: ["read:*", "write:agents", "write:packs", "execute:simulate", "execute:smoke"],
      description: "Can edit agents and packs",
    });
    this.roles.set("viewer", {
      name: "viewer",
      permissions: ["read:*"],
      description: "Read-only access",
    });
  }

  addUser(user: RBACUser): void {
    this.users.set(user.id, user);
    this.saveUsers();
  }

  hasPermission(userId: string, permission: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const role = this.roles.get(user.role);
    if (!role) return false;

    if (role.permissions.includes("*")) return true;
    return role.permissions.includes(permission) || role.permissions.some((p) => {
      const parts = p.split(":");
      return parts.length === 2 && parts[1] === "*" && permission.startsWith(parts[0] + ":");
    });
  }

  getUser(userId: string): RBACUser | null {
    return this.users.get(userId) || null;
  }

  saveUsers(): void {
    const usersDir = path.join(this.root, ".mcp", "rbac");
    if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });

    const usersPath = path.join(usersDir, "users.json");
    fs.writeFileSync(usersPath, JSON.stringify(Array.from(this.users.values()), null, 2));
  }

  loadUsers(): void {
    const usersPath = path.join(this.root, ".mcp", "rbac", "users.json");
    if (!fs.existsSync(usersPath)) return;

    try {
      const data = JSON.parse(fs.readFileSync(usersPath, "utf-8")) as RBACUser[];
      for (const user of data) {
        this.users.set(user.id, user);
      }
    } catch {
      // ignore
    }
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
