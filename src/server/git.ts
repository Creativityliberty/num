import { spawn } from "node:child_process";
import path from "node:path";
import { z } from "zod";
import type { Policy } from "../core/policy.js";

function runGit(args: string[], cwd: string): Promise<{ code: number; out: string; err: string }> {
  return new Promise((resolve) => {
    const p = spawn("git", args, { cwd, shell: false });
    let out = "";
    let err = "";
    p.stdout.on("data", (d: Buffer) => (out += d.toString()));
    p.stderr.on("data", (d: Buffer) => (err += d.toString()));
    p.on("close", (code) => resolve({ code: code ?? 1, out, err }));
  });
}

export function assertGitAllowed(policy: Policy): void {
  if (!policy.allowGit) throw new Error("GIT_DISABLED_BY_POLICY");
}

export const GitBranchNameSchema = z.string().min(3).max(80).regex(/^[a-zA-Z0-9._/-]+$/);

export function assertBranchAllowed(policy: Policy, name: string): void {
  const prefixes = policy.git.allowedBranchPrefixes;
  const ok = prefixes.some((p) => name.startsWith(p));
  if (!ok) throw new Error("BRANCH_PREFIX_NOT_ALLOWED");
}

export function assertCommitMessageAllowed(policy: Policy, msg: string): void {
  if (!policy.git.allowCommit) throw new Error("GIT_COMMIT_DISABLED_BY_POLICY");
  const re = new RegExp(policy.git.commitMessagePattern);
  if (!re.test(msg)) throw new Error("COMMIT_MESSAGE_REJECTED");
}

export async function gitStatus(policy: Policy): Promise<{ branch: string | null; porcelain: string }> {
  assertGitAllowed(policy);
  const cwd = path.resolve(policy.workspaceRoot);
  const r = await runGit(["status", "--porcelain=v1", "-b"], cwd);
  if (r.code !== 0) throw new Error(`GIT_STATUS_FAILED: ${r.err}`);
  const first = r.out.split("\n")[0] ?? "";
  const m = first.match(/^##\s+([^\s.]+)(?:\.\.\.)?/);
  return { branch: m?.[1] ?? null, porcelain: r.out };
}

export async function gitDiff(policy: Policy, staged: boolean, paths?: string[]): Promise<string> {
  assertGitAllowed(policy);
  const cwd = path.resolve(policy.workspaceRoot);
  const args = ["diff"];
  if (staged) args.push("--staged");
  if (paths?.length) args.push("--", ...paths);
  const r = await runGit(args, cwd);
  if (r.code !== 0) throw new Error(`GIT_DIFF_FAILED: ${r.err}`);
  return r.out;
}

export async function gitLog(policy: Policy, limit: number): Promise<string> {
  assertGitAllowed(policy);
  const cwd = path.resolve(policy.workspaceRoot);
  const r = await runGit(["log", "-n", String(limit), "--oneline", "--decorate"], cwd);
  if (r.code !== 0) throw new Error(`GIT_LOG_FAILED: ${r.err}`);
  return r.out;
}

export async function gitCreateBranch(policy: Policy, name: string): Promise<void> {
  assertGitAllowed(policy);
  GitBranchNameSchema.parse(name);
  assertBranchAllowed(policy, name);
  const cwd = path.resolve(policy.workspaceRoot);
  const r = await runGit(["checkout", "-b", name], cwd);
  if (r.code !== 0) throw new Error(`GIT_BRANCH_CREATE_FAILED: ${r.err}`);
}

export async function gitCommit(policy: Policy, message: string, addAll: boolean, dryRun: boolean): Promise<string> {
  assertGitAllowed(policy);
  assertCommitMessageAllowed(policy, message);
  const cwd = path.resolve(policy.workspaceRoot);

  if (dryRun) return "DRY_RUN";

  if (addAll) {
    const add = await runGit(["add", "-A"], cwd);
    if (add.code !== 0) throw new Error(`GIT_ADD_FAILED: ${add.err}`);
  }

  const c = await runGit(["commit", "-m", message], cwd);
  if (c.code !== 0) throw new Error(`GIT_COMMIT_FAILED: ${c.err}`);

  const sha = await runGit(["rev-parse", "HEAD"], cwd);
  if (sha.code !== 0) throw new Error(`GIT_REV_PARSE_FAILED: ${sha.err}`);
  return sha.out.trim();
}
