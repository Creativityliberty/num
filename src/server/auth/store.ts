import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UserSchema, type User } from "../../core/auth.schema.js";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export class UserStore {
  constructor(private root: string) {}

  private usersFile() {
    return path.join(this.root, ".mcp", "users.json");
  }

  async createUser(user: Omit<User, "passwordHash"> & { password: string }): Promise<User> {
    const users = await this.listUsers();
    if (users.find((u) => u.email === user.email)) {
      throw new Error("USER_EXISTS");
    }

    const newUser: User = UserSchema.parse({
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

  async getUser(id: string): Promise<User | null> {
    const users = await this.listUsers();
    return users.find((u) => u.id === id) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.listUsers();
    return users.find((u) => u.email === email) ?? null;
  }

  async listUsers(): Promise<User[]> {
    try {
      const raw = await fs.readFile(this.usersFile(), "utf-8");
      return JSON.parse(raw).map((u: unknown) => UserSchema.parse(u));
    } catch {
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<Pick<User, "role" | "enabled">>): Promise<User | null> {
    const users = await this.listUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    const user = users[idx]!;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.enabled !== undefined) user.enabled = updates.enabled;

    await fs.writeFile(this.usersFile(), JSON.stringify(users, null, 2));
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.listUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return false;

    users.splice(idx, 1);
    await fs.writeFile(this.usersFile(), JSON.stringify(users, null, 2));
    return true;
  }
}
