import fs from "node:fs/promises";
import path from "node:path";
import type { Policy } from "../core/policy.js";

export type BundleData = {
  meta: {
    sessionId: string;
    createdAt: string;
    workspaceRoot: string;
    modeId: string | null;
  };
  task: unknown;
  plan: unknown;
  runOutput: unknown;
  reviewOutput: unknown;
  execResults: unknown;
  git: {
    branch?: string;
    commitSha?: string;
  } | null;
};

export async function writeBundle(policy: Policy, sessionId: string, bundle: BundleData): Promise<string> {
  const root = path.resolve(policy.workspaceRoot);
  const dir = path.join(root, ".mcp", "bundles");
  await fs.mkdir(dir, { recursive: true });
  const p = path.join(dir, `${sessionId}.json`);
  await fs.writeFile(p, JSON.stringify(bundle, null, 2), "utf8");
  return p;
}
