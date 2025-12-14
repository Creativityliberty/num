import { describe, expect, it } from "vitest";
import { isExecAllowed, PolicySchema } from "../src/core/policy.js";
import { runCommandWithPolicy } from "../src/server/exec.js";

describe("exec.run v11.1 cmd/args + policy allowlist", () => {
  it("denies when allowExec=false", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: false,
      exec: { allowedExecutables: ["npm"], allowedArgs: { npm: [["test"]] } },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "npm", args: ["test"] });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/allowExec=false/);
  });

  it("denies executable not in allowlist", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["npm"], allowedArgs: { npm: [["test"]] } },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "node", args: ["-v"] });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/Executable not allowed/);
  });

  it("denies args not matching allowed pattern", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["npm"], allowedArgs: { npm: [["test"]] } },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "npm", args: ["run", "lint"] });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/Args not allowed/);
  });

  it("allows exact allowed args pattern", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["node"], allowedArgs: {} },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "node", args: ["-v"], timeoutMs: 30_000 });
    expect(result.exitCode).toBe(0);
    expect(result.command).toBe("node -v");
  });

  it("legacy fallback allowedCommands still works", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      allowedCommands: ["node -v"],
      exec: { allowedExecutables: [], allowedArgs: {} },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "node", args: ["-v"], timeoutMs: 30_000 });
    expect(result.exitCode).toBe(0);
  });

  it("denies cmd containing whitespace", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["node"], allowedArgs: {} },
    });
    await expect(
      runCommandWithPolicy(policy, { cmd: "node -v", args: [] })
    ).rejects.toThrow(/whitespace not allowed/);
  });

  it("denies shell operators in args", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["node"], allowedArgs: { node: [["-v"]] } },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "node", args: ["-v", "&&", "whoami"] });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/BLOCKED_TOKEN/i);
  });

  it("denies cwd outside workspace", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["node"], allowedArgs: { node: [["-v"]] } },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "node", args: ["-v"], cwd: "../../" });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/CWD_OUTSIDE_WORKSPACE/);
  });

  it("denies blocked executables like bash", async () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowExec: true,
      exec: { allowedExecutables: ["bash"], allowedArgs: {} },
    });
    const result = await runCommandWithPolicy(policy, { cmd: "bash", args: ["-c", "echo hello"] });
    expect(result.exitCode).toBe(-1);
    expect(result.stderr).toMatch(/BLOCKED_TOKEN/);
  });
});

describe("isExecAllowed", () => {
  it("allows when executable and args match", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      exec: { allowedExecutables: ["npm"], allowedArgs: { npm: [["test"], ["run", "lint"]] } },
    });
    expect(isExecAllowed(policy, "npm", ["test"]).ok).toBe(true);
    expect(isExecAllowed(policy, "npm", ["run", "lint"]).ok).toBe(true);
  });

  it("denies when args do not match", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      exec: { allowedExecutables: ["npm"], allowedArgs: { npm: [["test"]] } },
    });
    const result = isExecAllowed(policy, "npm", ["run", "build"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/Args not allowed/);
  });

  it("allows any args when allowedArgs not specified for executable", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      exec: { allowedExecutables: ["node"], allowedArgs: {} },
    });
    expect(isExecAllowed(policy, "node", ["-v"]).ok).toBe(true);
    expect(isExecAllowed(policy, "node", ["--version"]).ok).toBe(true);
  });

  it("uses legacy allowedCommands as fallback", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      allowedCommands: ["npm test", "npm run lint"],
      exec: { allowedExecutables: [], allowedArgs: {} },
    });
    expect(isExecAllowed(policy, "npm", ["test"]).ok).toBe(true);
    expect(isExecAllowed(policy, "npm", ["run", "lint"]).ok).toBe(true);
    expect(isExecAllowed(policy, "npm", ["run", "build"]).ok).toBe(false);
  });

  it("denies when no allowlist configured", () => {
    const policy = PolicySchema.parse({
      workspaceRoot: process.cwd(),
      exec: { allowedExecutables: [], allowedArgs: {} },
    });
    const result = isExecAllowed(policy, "npm", ["test"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/No exec allowlist configured/);
  });
});
