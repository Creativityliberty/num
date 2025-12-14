import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ExternalImportInputSchema } from "../src/core/externalImport.schema.js";
import { importExternalModes } from "../src/server/packs/importExternal.js";

describe("pack.import.external", () => {
  it("imports from docDump (dryRun)", async () => {
    const tmp = path.join(process.cwd(), ".tmp-import");
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const doc = `
slug: demo-agent
name: Demo Agent
groups: [read, edit]
roleDefinition: You are a demo.
customInstructions: Do the thing.
`;
    const inputPath = path.join(tmp, "doc.txt");
    fs.writeFileSync(inputPath, doc, "utf-8");

    const input = ExternalImportInputSchema.parse({
      sourceType: "docDump",
      inputPath,
      outModesDir: path.join(tmp, "modes"),
      packId: "num-pack",
      packOutDir: path.join(tmp, "pack"),
      dryRun: true,
      idPrefix: "num:",
    });

    const res = await importExternalModes(input);

    expect(res.ok).toBe(true);
    expect(res.importedCount).toBeGreaterThanOrEqual(1); // includes chef stubs
    expect(res.writtenFiles.length).toBeGreaterThan(0);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("imports from YAML (dryRun)", async () => {
    const tmp = path.join(process.cwd(), ".tmp-import-yaml");
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const yaml = `
customModes:
  - slug: yaml-agent
    name: YAML Agent
    groups:
      - read
      - command
    roleDefinition: You are a YAML agent.
    customInstructions: Process YAML files.
`;
    const inputPath = path.join(tmp, "modes.yaml");
    fs.writeFileSync(inputPath, yaml, "utf-8");

    const input = ExternalImportInputSchema.parse({
      sourceType: "customModesYaml",
      inputPath,
      outModesDir: path.join(tmp, "modes"),
      packId: "yaml-pack",
      packOutDir: path.join(tmp, "pack"),
      dryRun: true,
      idPrefix: "yaml:",
    });

    const res = await importExternalModes(input);

    expect(res.ok).toBe(true);
    expect(res.importedCount).toBeGreaterThanOrEqual(1);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("creates chef stubs when ensureChefStubs=true", async () => {
    const tmp = path.join(process.cwd(), ".tmp-import-stubs");
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });

    const doc = `
slug: random-agent
name: Random Agent
groups: [read]
customInstructions: Just do a small thing.
`;
    const inputPath = path.join(tmp, "doc.txt");
    fs.writeFileSync(inputPath, doc, "utf-8");

    const input = ExternalImportInputSchema.parse({
      sourceType: "docDump",
      inputPath,
      outModesDir: path.join(tmp, "modes"),
      packId: "num-pack",
      packOutDir: path.join(tmp, "pack"),
      dryRun: true,
      idPrefix: "num:",
      ensureChefStubs: true,
    });

    const res = await importExternalModes(input);

    expect(res.ok).toBe(true);
    // Should have 1 agent + 6 chef stubs = 7
    expect(res.importedCount).toBeGreaterThanOrEqual(7);
    // Check warnings for chef stubs
    const stubWarnings = res.warnings.filter((w: any) => w.kind === "CHEF_STUB_CREATED");
    expect(stubWarnings.length).toBe(6);

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
