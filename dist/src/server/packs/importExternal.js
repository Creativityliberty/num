import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { normalizeExternalAgents } from "../importers/external/normalize.js";
import { readDocDump } from "../importers/external/readDocDump.js";
import { readCustomModesYaml } from "../importers/external/readYaml.js";
import { buildNumPack } from "./buildNumPack.js";
export async function importExternalModes(input) {
    const warnings = [];
    let agents = [];
    if (input.sourceType === "customModesYaml") {
        const r = readCustomModesYaml(input.inputPath);
        agents = r.agents;
        warnings.push(...r.warnings);
    }
    else {
        const r = readDocDump(input.inputPath);
        agents = r.agents;
        warnings.push(...r.warnings);
    }
    const normalized = normalizeExternalAgents(agents, {
        idPrefix: input.idPrefix ?? "num:",
        aliasChefs: input.aliasChefs,
        ensureChefStubs: input.ensureChefStubs,
        chefStubMode: input.chefStubMode,
    });
    warnings.push(...normalized.warnings);
    const built = await buildNumPack({
        modes: normalized.modes,
        outModesDir: input.outModesDir,
        packId: input.packId,
        packOutDir: input.packOutDir,
        dryRun: input.dryRun,
    });
    // Bonus: write YAML files for humans
    if (!input.dryRun) {
        if (input.writePackYaml !== false) {
            const packYamlPath = path.join(input.packOutDir, "pack.yaml");
            const packData = {
                id: input.packId,
                version: "1.0.0",
                name: "Num Pack (imported)",
                description: "Imported agents converted to Num Agents modes/flows.",
                modesDir: path.relative(input.packOutDir, input.outModesDir).replace(/\\/g, "/"),
                modesCount: normalized.modes.length,
            };
            fs.writeFileSync(packYamlPath, yaml.dump(packData, { lineWidth: 120 }), "utf-8");
            built.writtenFiles.push(packYamlPath);
        }
        if (input.writeManifestYaml !== false) {
            const manifestPath = path.join(input.packOutDir, "manifest.yaml");
            const chefs = normalized.modes.filter((m) => (m.tags ?? []).includes("chef"));
            const stubs = normalized.modes.filter((m) => (m.tags ?? []).includes("stub"));
            const aliases = normalized.modes.filter((m) => (m.tags ?? []).includes("alias"));
            const manifestData = {
                packId: input.packId,
                importedAt: new Date().toISOString(),
                sourceType: input.sourceType,
                inputPath: input.inputPath,
                stats: {
                    total: normalized.modes.length,
                    chefs: chefs.length,
                    stubs: stubs.length,
                    aliases: aliases.length,
                },
                modes: normalized.modes.map((m) => ({
                    id: m.id,
                    name: m.name,
                    tags: m.tags,
                    flow: m.flow?.nodes?.length ? `${m.flow.nodes.length} nodes` : "solo",
                    disabled: m.disabled ?? false,
                })),
                warnings: warnings.map((w) => ({ kind: w.kind, message: w.message, ref: w.ref })),
            };
            fs.writeFileSync(manifestPath, yaml.dump(manifestData, { lineWidth: 120 }), "utf-8");
            built.writtenFiles.push(manifestPath);
        }
    }
    return {
        ok: true,
        importedCount: normalized.modes.length,
        writtenFiles: built.writtenFiles,
        packJsonPath: built.packJsonPath,
        warnings,
    };
}
