import { describe, expect, it } from "vitest";
import { hasPermission, requiredPermissionForTool } from "../src/server/auth/rbac.js";

describe("18.0 RBAC", () => {
  it("admin has all permissions", () => {
    const user = { roles: ["admin" as const] };
    expect(hasPermission(user, "modes.read")).toBe(true);
    expect(hasPermission(user, "modes.write")).toBe(true);
    expect(hasPermission(user, "pipeline.apply")).toBe(true);
    expect(hasPermission(user, "git.write")).toBe(true);
    expect(hasPermission(user, "policy.admin")).toBe(true);
  });

  it("developer has limited permissions", () => {
    const user = { roles: ["developer" as const] };
    expect(hasPermission(user, "modes.read")).toBe(true);
    expect(hasPermission(user, "modes.write")).toBe(false);
    expect(hasPermission(user, "pipeline.apply")).toBe(true);
    expect(hasPermission(user, "policy.admin")).toBe(false);
  });

  it("viewer has read-only permissions", () => {
    const user = { roles: ["viewer" as const] };
    expect(hasPermission(user, "modes.read")).toBe(true);
    expect(hasPermission(user, "packs.read")).toBe(true);
    expect(hasPermission(user, "orchestrate.run")).toBe(false);
    expect(hasPermission(user, "pipeline.apply")).toBe(false);
    expect(hasPermission(user, "git.write")).toBe(false);
  });

  it("user with no roles has no permissions", () => {
    const user = { roles: [] };
    expect(hasPermission(user, "modes.read")).toBe(false);
  });

  it("maps tools to permissions correctly", () => {
    expect(requiredPermissionForTool("modes.list")).toBe("modes.read");
    expect(requiredPermissionForTool("modes.get")).toBe("modes.read");
    expect(requiredPermissionForTool("pack.import")).toBe("packs.import");
    expect(requiredPermissionForTool("pack.export")).toBe("packs.export");
    expect(requiredPermissionForTool("pack.list")).toBe("packs.read");
    expect(requiredPermissionForTool("agents.plan")).toBe("orchestrate.run");
    expect(requiredPermissionForTool("orchestrate.run")).toBe("orchestrate.run");
    expect(requiredPermissionForTool("pipeline.applyAndVerify")).toBe("pipeline.apply");
    expect(requiredPermissionForTool("exec.run")).toBe("pipeline.apply");
    expect(requiredPermissionForTool("git.commit")).toBe("git.write");
  });

  it("returns null for unknown tools", () => {
    expect(requiredPermissionForTool("unknown.tool")).toBeNull();
  });
});
