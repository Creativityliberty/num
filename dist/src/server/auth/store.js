import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UserSchema } from "../../core/auth.schema.js";
export function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}
export function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}
export class UserStore {
    root;
    constructor(root) {
        this.root = root;
    }
    usersFile() {
        return path.join(this.root, ".mcp", "users.json");
    }
    async createUser(user) {
        const users = await this.listUsers();
        if (users.find((u) => u.email === user.email)) {
            throw new Error("USER_EXISTS");
        }
        const newUser = UserSchema.parse({
            id: user.id,
            email: user.email,
            passwordHash: hashPassword(user.password),
            role: user.role,
            tenantId: user.tenantId,
            enabled: user.enabled ?? true,
            createdAt: new Date().toISOString(),
        });
        users.push(newUser);
        await fs.mkdir(path.dirname(this.usersFile()), { recursive: true });
        await fs.writeFile(this.usersFile(), JSON.stringify(users, null, 2));
        return newUser;
    }
    async getUser(id) {
        const users = await this.listUsers();
        return users.find((u) => u.id === id) ?? null;
    }
    async getUserByEmail(email) {
        const users = await this.listUsers();
        return users.find((u) => u.email === email) ?? null;
    }
    async listUsers() {
        try {
            const raw = await fs.readFile(this.usersFile(), "utf-8");
            return JSON.parse(raw).map((u) => UserSchema.parse(u));
        }
        catch {
            return [];
        }
    }
    async updateUser(id, updates) {
        const users = await this.listUsers();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1)
            return null;
        const user = users[idx];
        if (updates.role !== undefined)
            user.role = updates.role;
        if (updates.enabled !== undefined)
            user.enabled = updates.enabled;
        await fs.writeFile(this.usersFile(), JSON.stringify(users, null, 2));
        return user;
    }
    async deleteUser(id) {
        const users = await this.listUsers();
        const idx = users.findIndex((u) => u.id === id);
        if (idx === -1)
            return false;
        users.splice(idx, 1);
        await fs.writeFile(this.usersFile(), JSON.stringify(users, null, 2));
        return true;
    }
}
