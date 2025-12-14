import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { computeStats } from "../src/dashboard/data/stats.js";

async function writeRun(tmp: string, runId: string, state: string, modeId: string) {
  const dir = path.join(tmp, ".mcp", "runs");
  await fs.mkdir(dir, { recursive: true });
  const now = new Date().toISOString();
  const run = {
    runId,
    sessionId: "s-" + runId,
    createdAt: now,
    updatedAt: now,
    state,
    task: { goal: "x", context: {} },
    flow: { usePlanPrompt: true, useReview: true, autoApply: false, autoCommit: false, createBranch: false, dryRun: true, maxFixIterations: 2 },
    selectedMode: { id: modeId, name: modeId, confidence: 0.5 },
    fixIterations: 0,
    history: [
      { ts: now, from: "INIT", to: "MODE_SELECTED" },
    ],
  };
  await fs.writeFile(path.join(dir, `${runId}.json`), JSON.stringify(run, null, 2), "utf8");
}

describe("dashboard stats", () => {
  it("computes basic stats", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-dash-"));
    await writeRun(tmp, "r1", "DONE", "m1");
    await writeRun(tmp, "r2", "FAILED", "m1");
    await writeRun(tmp, "r3", "CANCELLED", "m2");
    const s = await computeStats(tmp, "all");
    expect(s.total).toBe(3);
    expect(s.states.DONE).toBe(1);
    expect(s.topModes[0]?.modeId).toBe("m1");
  });

  it("returns empty stats for missing dir", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-dash-empty-"));
    const s = await computeStats(tmp, "all");
    expect(s.total).toBe(0);
  });
});
