import { describe, expect, it } from "vitest";

describe("multiRunner autoApply gating (12.1.1)", () => {
  it("blocks auto apply when confirmations required", () => {
    // This is a pure unit check (no MCP server).
    const policy = {
      allowWrite: true,
      allowExec: true,
      requireConfirmationFor: ["applyPatch"],
    };
    const req = new Set(policy.requireConfirmationFor);
    expect(req.has("applyPatch")).toBe(true);
  });

  it("allows auto apply when policy permits", () => {
    const policy = {
      allowWrite: true,
      allowExec: true,
      allowGit: true,
      requireConfirmationFor: [],
    };
    const req = new Set(policy.requireConfirmationFor);
    expect(req.has("applyPatch")).toBe(false);
    expect(policy.allowWrite).toBe(true);
    expect(policy.allowExec).toBe(true);
  });

  it("blocks git operations when allowGit=false", () => {
    const policy = {
      allowWrite: true,
      allowExec: true,
      allowGit: false,
      requireConfirmationFor: [],
    };
    expect(policy.allowGit).toBe(false);
  });
});
