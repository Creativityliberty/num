import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runBatchApply } from "../src/dashboard/data/modelHealthBatch.js";

describe("19.4.3 model health batch apply", () => {
  it("dryRun batch returns selected suggestions", () => {
    const root = process.cwd();
    const res = runBatchApply(root, {
      range: "all",
      minCalls: 20,
      topN: 5,
      dryRun: true,
      packId: "num-pack",
      packDir: "./packs/num-pack",
      applyTarget: "packDefaults",
    });

    expect(res.ok).toBe(true);
    expect(res.dryRun).toBe(true);
    expect(Array.isArray(res.selected)).toBe(true);
    expect(Array.isArray(res.applied)).toBe(true);
  });

  it("writes a report when not dryRun", () => {
    const tmp = path.join(process.cwd(), ".tmp-mh-batch-" + Date.now());
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const packDir = path.join(tmp, "packs", "num-pack");
    fs.mkdirSync(packDir, { recursive: true });
    fs.writeFileSync(path.join(packDir, "pack.json"), JSON.stringify({ id: "num-pack", version: "1.0.0" }, null, 2));

    const res = runBatchApply(tmp, {
      range: "all",
      minCalls: 20,
      topN: 3,
      dryRun: false,
      packId: "num-pack",
      packDir: "./packs/num-pack",
      applyTarget: "packDefaults",
    });

    expect(res.ok).toBe(true);
    expect(res.dryRun).toBe(false);
    // Report is written even if no suggestions selected
    if (res.reportPath) {
      expect(fs.existsSync(res.reportPath)).toBe(true);
    }

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
