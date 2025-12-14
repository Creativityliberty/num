import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hasBackup, loadRun, saveRun } from "../src/dashboard/data/runs.js";

describe("dashboard rollback availability (11.4)", () => {
  it("detects backup folder presence", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-backup-"));
    const runId = "r1";
    expect(await hasBackup(tmp, runId)).toBe(false);
    await fs.mkdir(path.join(tmp, ".mcp", "backups", runId), { recursive: true });
    expect(await hasBackup(tmp, runId)).toBe(true);
  });

  it("persists rollback field into run record (11.4.1)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-save-run-"));
    const now = new Date().toISOString();
    const run = {
      runId: "r1",
      sessionId: "s1",
      createdAt: now,
      updatedAt: now,
      state: "DONE" as const,
      task: { goal: "test goal", context: {} },
      flow: { autoApply: false },
      history: [],
      rollback: {
        ts: now,
        kind: "manual" as const,
        ok: true,
        runId: "r1",
        restoredCount: 1,
        restored: ["src/a.ts"],
      },
    };
    await saveRun(tmp, run);
    const loaded = await loadRun(tmp, "r1");
    expect(loaded.rollback?.ok).toBe(true);
    expect(loaded.rollback?.restoredCount).toBe(1);
  });
});
