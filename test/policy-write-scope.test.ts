import { describe, expect, it } from "vitest";
import { PolicySchema, isWritePathAllowed, requiresConfirmation } from "../src/core/policy.js";

describe("policy write scopes (11.2)", () => {
  it("denies blocked paths even if allowedWritePaths is empty", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowWrite: true,
      blockedWritePaths: [".git/**", "node_modules/**"],
    });
    expect(isWritePathAllowed(p, ".git/config").ok).toBe(false);
    expect(isWritePathAllowed(p, "node_modules/x/y.js").ok).toBe(false);
  });

  it("enforces allowedWritePaths when provided", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowWrite: true,
      allowedWritePaths: ["src/**", "test/**"],
      blockedWritePaths: [".git/**"],
    });
    expect(isWritePathAllowed(p, "src/index.ts").ok).toBe(true);
    expect(isWritePathAllowed(p, "test/a.test.ts").ok).toBe(true);
    expect(isWritePathAllowed(p, "README.md").ok).toBe(false);
  });

  it("supports * and **", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowWrite: true,
      allowedWritePaths: ["src/*.ts", "packages/**"],
    });
    expect(isWritePathAllowed(p, "src/a.ts").ok).toBe(true);
    expect(isWritePathAllowed(p, "src/nested/a.ts").ok).toBe(false);
    expect(isWritePathAllowed(p, "packages/client/src/index.ts").ok).toBe(true);
  });

  it("blocked paths win over allowed paths", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowWrite: true,
      allowedWritePaths: ["**"],
      blockedWritePaths: [".git/**"],
    });
    expect(isWritePathAllowed(p, "src/index.ts").ok).toBe(true);
    expect(isWritePathAllowed(p, ".git/config").ok).toBe(false);
  });

  it("allows all when no allowedWritePaths specified", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowWrite: true,
      allowedWritePaths: [],
      blockedWritePaths: [],
    });
    expect(isWritePathAllowed(p, "any/path/file.ts").ok).toBe(true);
  });
});

describe("policy requiresConfirmation (11.2)", () => {
  it("returns true when action is in requireConfirmationFor", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      requireConfirmationFor: ["applyPatch", "exec"],
    });
    expect(requiresConfirmation(p, "applyPatch")).toBe(true);
    expect(requiresConfirmation(p, "exec")).toBe(true);
    expect(requiresConfirmation(p, "branch")).toBe(false);
    expect(requiresConfirmation(p, "commit")).toBe(false);
  });

  it("returns false when requireConfirmationFor is empty", () => {
    const p = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      requireConfirmationFor: [],
    });
    expect(requiresConfirmation(p, "applyPatch")).toBe(false);
    expect(requiresConfirmation(p, "exec")).toBe(false);
  });
});
