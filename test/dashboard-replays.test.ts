import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listReplays, loadReplay } from "../src/dashboard/data/replays.js";

describe("dashboard replays", () => {
  it("lists and loads replay reports", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-replays-"));
    const dir = path.join(tmp, ".mcp", "replays");
    await fs.mkdir(dir, { recursive: true });
    const runId = "r-123";
    await fs.writeFile(path.join(dir, runId + ".json"), JSON.stringify({ runId, ok: true, summary: { a: 1 } }, null, 2), "utf8");
    const items = await listReplays(tmp);
    expect(items.length).toBe(1);
    expect(items[0]?.runId).toBe(runId);
    const rep = await loadReplay(tmp, runId);
    expect((rep as { ok: boolean }).ok).toBe(true);
  });

  it("returns empty list for missing dir", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-replays-empty-"));
    const items = await listReplays(tmp);
    expect(items.length).toBe(0);
  });
});
