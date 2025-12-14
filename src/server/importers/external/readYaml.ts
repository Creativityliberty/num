import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { ExternalAgent, ImportWarning } from "./types.js";

function isYamlFile(p: string) {
  return p.endsWith(".yml") || p.endsWith(".yaml");
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && isYamlFile(p)) out.push(p);
  }
  return out;
}

export function readCustomModesYaml(inputPath: string) {
  const warnings: ImportWarning[] = [];
  const files: string[] = [];
  const stat = fs.statSync(inputPath);
  if (stat.isDirectory()) files.push(...walk(inputPath));
  else files.push(inputPath);

  const agents: ExternalAgent[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(f, "utf-8");
    try {
      const doc: any = yaml.load(raw);
      // Support both single object and { customModes: [...] }
      if (Array.isArray(doc?.customModes)) {
        for (const m of doc.customModes) agents.push(mapYamlMode(m, f));
      } else if (Array.isArray(doc)) {
        for (const m of doc) agents.push(mapYamlMode(m, f));
      } else if (doc && typeof doc === "object") {
        agents.push(mapYamlMode(doc, f));
      } else {
        warnings.push({ kind: "YAML_SKIP", message: "Unsupported YAML shape", ref: f });
      }
    } catch (e: any) {
      warnings.push({ kind: "YAML_PARSE_ERROR", message: String(e?.message ?? e), ref: f });
    }
  }
  return { agents, warnings };
}

function mapYamlMode(m: any, ref: string): ExternalAgent {
  return {
    slug: String(m?.slug ?? m?.id ?? m?.name ?? "").trim(),
    name: m?.name ? String(m.name) : undefined,
    description: m?.description ? String(m.description) : undefined,
    roleDefinition: m?.roleDefinition ? String(m.roleDefinition) : undefined,
    whenToUse: m?.whenToUse ? String(m.whenToUse) : undefined,
    groups: Array.isArray(m?.groups) ? m.groups.map(String) : undefined,
    customInstructions: m?.customInstructions ? String(m.customInstructions) : undefined,
    source: m?.source ? String(m.source) : ref,
    version: m?.version ? String(m.version) : undefined,
  };
}
