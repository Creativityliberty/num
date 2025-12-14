import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compareRunToReplay } from "../src/dashboard/data/compare.js";

async function writeRun(tmp: string, runId: string) {
  const dir = path.join(tmp, ".mcp", "runs");
  await fs.mkdir(dir, { recursive: true });
  const now = new Date().toISOString();
  const run = {
    runId,
    sessionId: "s-" + runId,
    createdAt: now,
    updatedAt: now,
    state: "DONE",
    task: { goal: "x", context: {} },
    flow: { usePlanPrompt: true, useReview: true, autoApply: false, autoCommit: false, createBranch: false, dryRun: true, maxFixIterations: 2 },
    selectedMode: { id: "m1", name: "m1", confidence: 0.5 },
    fixIterations: 0,
    history: [],
    runOutput: { patch: "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@\n", commands: ["npm test"] },
    pipeline: { apply: { filesChanged: 1, insertions: 2, deletions: 0 }, exec: [{ command: "npm test", exitCode: 0, durationMs: 1000 }] },
  };
  await fs.writeFile(path.join(dir, `${runId}.json`), JSON.stringify(run, null, 2), "utf8");
}

async function writeReplay(tmp: string, runId: string) {
  const dir = path.join(tmp, ".mcp", "replays");
  await fs.mkdir(dir, { recursive: true });
  const replay = {
    runId,
    sessionId: "s-" + runId,
    ok: true,
    checks: [{ name: "commands.allowlist", ok: true }],
    summary: { patch: { filesChanged: 1, insertions: 2, deletions: 0 } },
    wroteReportPath: path.join(dir, `${runId}.json`),
  };
  await fs.writeFile(path.join(dir, `${runId}.json`), JSON.stringify(replay, null, 2), "utf8");
}

describe("dashboard compare", () => {
  it("compares run to replay with no mismatches", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-cmp-"));
    const runId = "r1";
    await writeRun(tmp, runId);
    await writeReplay(tmp, runId);
    const cmp = await compareRunToReplay(tmp, runId);
    expect(cmp.mismatches).toBe(0);
    expect(cmp.details.diffs.patchStats).toEqual({ ok: true });
  });

  it("detects mismatch when patch stats differ", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-cmp2-"));
    const runId = "r2";
    await writeRun(tmp, runId);

    const dir = path.join(tmp, ".mcp", "replays");
    await fs.mkdir(dir, { recursive: true });
    const replay = {
      runId,
      sessionId: "s-" + runId,
      ok: true,
      checks: [{ name: "commands.allowlist", ok: true }],
      summary: { patch: { filesChanged: 5, insertions: 10, deletions: 3 } },
      wroteReportPath: path.join(dir, `${runId}.json`),
    };
    await fs.writeFile(path.join(dir, `${runId}.json`), JSON.stringify(replay, null, 2), "utf8");

    const cmp = await compareRunToReplay(tmp, runId);
    expect(cmp.mismatches).toBe(1);
  });
});
