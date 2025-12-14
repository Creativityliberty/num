import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
export class AuditLogger {
    root;
    constructor(root) {
        this.root = root;
    }
    log(entry) {
        const auditEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...entry,
        };
        const auditDir = path.join(this.root, ".mcp", "audit");
        if (!fs.existsSync(auditDir))
            fs.mkdirSync(auditDir, { recursive: true });
        const auditPath = path.join(auditDir, `${auditEntry.timestamp.split("T")[0]}.jsonl`);
        fs.appendFileSync(auditPath, JSON.stringify(auditEntry) + "\n");
        return auditEntry;
    }
    getLogs(days = 7) {
        const auditDir = path.join(this.root, ".mcp", "audit");
        if (!fs.existsSync(auditDir))
            return [];
        const logs = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const files = fs.readdirSync(auditDir).filter((f) => f.endsWith(".jsonl"));
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(auditDir, file), "utf-8");
                const lines = content.trim().split("\n");
                for (const line of lines) {
                    if (line) {
                        const entry = JSON.parse(line);
                        if (new Date(entry.timestamp) >= cutoffDate) {
                            logs.push(entry);
                        }
                    }
                }
            }
            catch {
                // ignore
            }
        }
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
}
export class RBACManager {
    root;
    roles = new Map();
    users = new Map();
    constructor(root) {
        this.root = root;
        this.initializeDefaultRoles();
    }
    initializeDefaultRoles() {
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
    addUser(user) {
        this.users.set(user.id, user);
        this.saveUsers();
    }
    hasPermission(userId, permission) {
        const user = this.users.get(userId);
        if (!user)
            return false;
        const role = this.roles.get(user.role);
        if (!role)
            return false;
        if (role.permissions.includes("*"))
            return true;
        return role.permissions.includes(permission) || role.permissions.some((p) => {
            const parts = p.split(":");
            return parts.length === 2 && parts[1] === "*" && permission.startsWith(parts[0] + ":");
        });
    }
    getUser(userId) {
        return this.users.get(userId) || null;
    }
    saveUsers() {
        const usersDir = path.join(this.root, ".mcp", "rbac");
        if (!fs.existsSync(usersDir))
            fs.mkdirSync(usersDir, { recursive: true });
        const usersPath = path.join(usersDir, "users.json");
        fs.writeFileSync(usersPath, JSON.stringify(Array.from(this.users.values()), null, 2));
    }
    loadUsers() {
        const usersPath = path.join(this.root, ".mcp", "rbac", "users.json");
        if (!fs.existsSync(usersPath))
            return;
        try {
            const data = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
            for (const user of data) {
                this.users.set(user.id, user);
            }
        }
        catch {
            // ignore
        }
    }
}
export function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}
export function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}
export function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}
