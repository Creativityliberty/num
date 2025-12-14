import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hasPermission, ROLE_PERMISSIONS } from "../src/core/auth.schema.js";
import { createToken, extractBearerToken, verifyToken } from "../src/server/auth/jwt.js";
import { hashPassword, UserStore, verifyPassword } from "../src/server/auth/store.js";
describe("14.1 auth & JWT", () => {
    it("creates and verifies JWT token", () => {
        const token = createToken({
            sub: "user-1",
            email: "test@example.com",
            role: "developer",
            tenantId: "acme",
        });
        expect(token).toBeTruthy();
        expect(token.split(".").length).toBe(3);
        const payload = verifyToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.sub).toBe("user-1");
        expect(payload?.email).toBe("test@example.com");
        expect(payload?.role).toBe("developer");
    });
    it("rejects invalid token", () => {
        const payload = verifyToken("invalid.token.here");
        expect(payload).toBeNull();
    });
    it("rejects expired token", () => {
        const token = createToken({ sub: "user-1", email: "test@example.com", role: "developer", tenantId: "acme" }, { expirySeconds: -1 });
        const payload = verifyToken(token);
        expect(payload).toBeNull();
    });
    it("extracts bearer token from header", () => {
        expect(extractBearerToken("Bearer abc123")).toBe("abc123");
        expect(extractBearerToken("bearer abc123")).toBeNull();
        expect(extractBearerToken("abc123")).toBeNull();
        expect(extractBearerToken(undefined)).toBeNull();
    });
    it("hashes and verifies password", () => {
        const hash = hashPassword("secret123");
        expect(verifyPassword("secret123", hash)).toBe(true);
        expect(verifyPassword("wrong", hash)).toBe(false);
    });
    it("creates and retrieves user", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-auth-"));
        const store = new UserStore(tmp);
        const user = await store.createUser({
            id: "user-1",
            email: "dev@acme.com",
            password: "secret",
            role: "developer",
            tenantId: "acme",
            enabled: true,
        });
        expect(user.id).toBe("user-1");
        expect(user.passwordHash).toBeTruthy();
        const retrieved = await store.getUser("user-1");
        expect(retrieved?.email).toBe("dev@acme.com");
        const byEmail = await store.getUserByEmail("dev@acme.com");
        expect(byEmail?.id).toBe("user-1");
    });
    it("prevents duplicate email", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-auth-"));
        const store = new UserStore(tmp);
        await store.createUser({ id: "u1", email: "dup@test.com", password: "p", role: "viewer", tenantId: "t", enabled: true });
        await expect(store.createUser({ id: "u2", email: "dup@test.com", password: "p", role: "viewer", tenantId: "t", enabled: true })).rejects.toThrow("USER_EXISTS");
    });
    it("hasPermission checks role permissions", () => {
        const admin = { id: "a", email: "a@t.com", passwordHash: "x", role: "admin", tenantId: "t", enabled: true };
        const dev = { id: "d", email: "d@t.com", passwordHash: "x", role: "developer", tenantId: "t", enabled: true };
        const viewer = { id: "v", email: "v@t.com", passwordHash: "x", role: "viewer", tenantId: "t", enabled: true };
        expect(hasPermission(admin, "tenant.manage")).toBe(true);
        expect(hasPermission(admin, "orchestrate.run")).toBe(true);
        expect(hasPermission(dev, "orchestrate.run")).toBe(true);
        expect(hasPermission(dev, "tenant.manage")).toBe(false);
        expect(hasPermission(viewer, "modes.read")).toBe(true);
        expect(hasPermission(viewer, "orchestrate.run")).toBe(false);
    });
    it("ROLE_PERMISSIONS is complete", () => {
        expect(ROLE_PERMISSIONS.admin.length).toBeGreaterThan(0);
        expect(ROLE_PERMISSIONS.developer.length).toBeGreaterThan(0);
        expect(ROLE_PERMISSIONS.viewer.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=auth-jwt.test.js.map