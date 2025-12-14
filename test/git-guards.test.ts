import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { assertBranchAllowed, assertCommitMessageAllowed } from "../src/server/git.js";

describe("git guards", () => {
  it("rejects branch without allowed prefix", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/"], allowCommit: true, commitMessagePattern: "^.{5,120}$" },
    });
    expect(() => assertBranchAllowed(policy, "feat/test")).toThrow("BRANCH_PREFIX_NOT_ALLOWED");
  });

  it("accepts branch with allowed prefix", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/"], allowCommit: true, commitMessagePattern: "^.{5,120}$" },
    });
    expect(() => assertBranchAllowed(policy, "mcp/test")).not.toThrow();
  });

  it("accepts branch with any allowed prefix", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/", "fix/", "feat/"], allowCommit: true },
    });
    expect(() => assertBranchAllowed(policy, "fix/bug-123")).not.toThrow();
    expect(() => assertBranchAllowed(policy, "feat/new-feature")).not.toThrow();
  });

  it("rejects commit message that violates pattern", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/"], allowCommit: true, commitMessagePattern: "^.{10,120}$" },
    });
    expect(() => assertCommitMessageAllowed(policy, "short")).toThrow("COMMIT_MESSAGE_REJECTED");
  });

  it("accepts commit message that matches pattern", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/"], allowCommit: true, commitMessagePattern: "^.{10,120}$" },
    });
    expect(() => assertCommitMessageAllowed(policy, "This is a valid commit message")).not.toThrow();
  });

  it("rejects commit when allowCommit is false", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: "/tmp",
      allowGit: true,
      git: { allowedBranchPrefixes: ["mcp/"], allowCommit: false },
    });
    expect(() => assertCommitMessageAllowed(policy, "Any message")).toThrow("GIT_COMMIT_DISABLED_BY_POLICY");
  });
});
