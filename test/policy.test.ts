import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";

describe("policy schema", () => {
  it("parses minimal policy", () => {
    const p = PolicySchema.parse({ workspaceRoot: "/tmp" });
    expect(p.workspaceRoot).toBe("/tmp");
    expect(p.allowWrite).toBe(false);
    expect(p.allowExec).toBe(false);
    expect(p.allowGit).toBe(false);
  });

  it("parses full policy", () => {
    const p = PolicySchema.parse({
      workspaceRoot: "/my/repo",
      allowWrite: true,
      allowExec: true,
      allowGit: true,
      maxPatchBytes: 1000000,
      maxFilesChanged: 100,
      allowedCommands: ["npm test", "npm run lint"],
      git: {
        allowedBranchPrefixes: ["mcp/", "fix/"],
        allowCommit: true,
        commitMessagePattern: "^.{10,100}$",
        allowPush: false,
      },
    });
    expect(p.allowWrite).toBe(true);
    expect(p.allowExec).toBe(true);
    expect(p.allowGit).toBe(true);
    expect(p.maxPatchBytes).toBe(1000000);
    expect(p.allowedCommands).toContain("npm test");
    expect(p.git.allowedBranchPrefixes).toContain("mcp/");
    expect(p.git.allowCommit).toBe(true);
  });

  it("applies defaults for git sub-object", () => {
    const p = PolicySchema.parse({ workspaceRoot: "/tmp" });
    expect(p.git.allowedBranchPrefixes).toEqual(["mcp/", "fix/", "feat/"]);
    expect(p.git.allowCommit).toBe(false);
    expect(p.git.allowPush).toBe(false);
  });
});
