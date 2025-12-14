import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyModelFallbackSuggestion } from "../src/dashboard/data/modelHealthApply.js";

describe("19.4.2 apply model fallback suggestion", () => {
  it("updates pack.json runtimePolicy.defaults.model.fallbacks (dryRun)", () => {
    const tmp = path.join(process.cwd(), ".tmp-pack-apply-" + Date.now());
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const packDir = path.join(tmp, "packs", "num-pack");
    fs.mkdirSync(packDir, { recursive: true });
    const packJson = {
      id: "num-pack",
      version: "1.0.0",
      runtimePolicy: {
        defaults: {
          model: {
            preferred: { provider: "openai", model: "gpt-4.1" },
            fallbacks: [{ provider: "openai", model: "gpt-4.1-mini" }],
          },
        },
      },
    };
    fs.writeFileSync(path.join(packDir, "pack.json"), JSON.stringify(packJson, null, 2), "utf-8");

    const res = applyModelFallbackSuggestion(tmp, {
      packId: "num-pack",
      packDir: "./packs/num-pack",
      applyTarget: "packDefaults",
      from: { provider: "openai", model: "gpt-4.1" },
      to: { provider: "openai", model: "gpt-4.0-mini" },
      dryRun: true,
    });

    expect(res.ok).toBe(true);
    expect(res.dryRun).toBe(true);
    expect(res.changes.length).toBe(1);
    const after = res.changes[0]!.after as { defaults: { model: { fallbacks: { provider: string; model: string }[] } } };
    expect(after.defaults.model.fallbacks[0]).toEqual({ provider: "openai", model: "gpt-4.0-mini" });

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("updates mode runtimePolicy.model.fallbacks (write)", () => {
    const tmp = path.join(process.cwd(), ".tmp-mode-apply-" + Date.now());
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const modesDir = path.join(tmp, "modes", "num");
    fs.mkdirSync(modesDir, { recursive: true });
    const mode = {
      id: "num:code-fix",
      name: "Code Fix",
      tags: ["code"],
      flow: { version: "1", nodes: [], edges: [] },
    };
    fs.writeFileSync(path.join(modesDir, "code-fix.json"), JSON.stringify(mode, null, 2), "utf-8");

    const res = applyModelFallbackSuggestion(tmp, {
      packId: "num-pack",
      packDir: "./packs/num-pack",
      modesDir: "./modes/num",
      applyTarget: "mode",
      modeId: "num:code-fix",
      from: { provider: "anthropic", model: "claude-x" },
      to: { provider: "anthropic", model: "claude-y" },
      dryRun: false,
    });

    expect(res.ok).toBe(true);
    const updated = JSON.parse(fs.readFileSync(path.join(modesDir, "code-fix.json"), "utf-8"));
    expect(updated.runtimePolicy.model.fallbacks[0]).toEqual({ provider: "anthropic", model: "claude-y" });

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
