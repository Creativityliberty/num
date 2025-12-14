import fs from "node:fs";
import path from "node:path";

type ModelRef = { provider: string; model: string };

export type ApplySuggestionInput = {
  packId: string;
  packDir: string;
  modesDir?: string;
  applyTarget: "packDefaults" | "mode";
  modeId?: string;
  from: ModelRef;
  to: ModelRef;
  dryRun?: boolean;
};

export type ApplySuggestionResult = {
  ok: boolean;
  dryRun: boolean;
  target: "packDefaults" | "mode";
  written?: string[];
  changes: Array<{ file: string; before: unknown; after: unknown }>;
  reportPath?: string;
};

function readJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(p: string, obj: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function sameModel(a?: ModelRef, b?: ModelRef) {
  if (!a || !b) return false;
  return a.provider === b.provider && a.model === b.model;
}

function ensureArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

function nowId() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

function findModeFile(modesDir: string, modeId: string) {
  const slug = String(modeId).includes(":") ? String(modeId).split(":")[1]! : String(modeId);
  return path.join(modesDir, `${slug}.json`);
}

export function applyModelFallbackSuggestion(root: string, input: ApplySuggestionInput): ApplySuggestionResult {
  const dryRun = !!input.dryRun;
  const changes: ApplySuggestionResult["changes"] = [];
  const written: string[] = [];

  if (input.applyTarget === "packDefaults") {
    const packJsonPath = path.join(root, input.packDir, "pack.json");
    const before = readJson(packJsonPath) as Record<string, unknown>;

    const after = structuredClone(before) as Record<string, unknown>;
    after.runtimePolicy = (after.runtimePolicy as Record<string, unknown>) ?? {};
    const rp = after.runtimePolicy as Record<string, unknown>;
    rp.defaults = (rp.defaults as Record<string, unknown>) ?? {};
    const defaults = rp.defaults as Record<string, unknown>;
    defaults.model = (defaults.model as Record<string, unknown>) ?? {};
    const model = defaults.model as Record<string, unknown>;

    if (!model.preferred) {
      model.preferred = input.from;
    }

    const fallbacks = ensureArr<ModelRef>(model.fallbacks);
    const filtered = fallbacks.filter((m) => !sameModel(m, input.from));

    const nextFallbacks: ModelRef[] = [input.to, ...filtered].filter((m, idx, arr) => {
      return idx === arr.findIndex((x) => sameModel(x, m));
    });

    model.fallbacks = nextFallbacks;

    changes.push({ file: packJsonPath, before: before.runtimePolicy ?? null, after: after.runtimePolicy ?? null });
    if (!dryRun) {
      writeJson(packJsonPath, after);
      written.push(packJsonPath);
    }

  } else {
    if (!input.modesDir) throw new Error("modesDir required for applyTarget=mode");
    if (!input.modeId) throw new Error("modeId required for applyTarget=mode");

    const modePath = findModeFile(path.join(root, input.modesDir), input.modeId);
    const before = readJson(modePath) as Record<string, unknown>;
    const after = structuredClone(before) as Record<string, unknown>;

    after.runtimePolicy = (after.runtimePolicy as Record<string, unknown>) ?? {};
    const rp = after.runtimePolicy as Record<string, unknown>;
    rp.model = (rp.model as Record<string, unknown>) ?? {};
    const model = rp.model as Record<string, unknown>;

    const fallbacks = ensureArr<ModelRef>(model.fallbacks);
    const filtered = fallbacks.filter((m) => !sameModel(m, input.from));
    const nextFallbacks: ModelRef[] = [input.to, ...filtered].filter((m, idx, arr) => {
      return idx === arr.findIndex((x) => sameModel(x, m));
    });
    model.fallbacks = nextFallbacks;

    changes.push({ file: modePath, before: before.runtimePolicy ?? null, after: after.runtimePolicy ?? null });
    if (!dryRun) {
      writeJson(modePath, after);
      written.push(modePath);
    }
  }

  const report = {
    id: `model-health-apply-${nowId()}`,
    ts: new Date().toISOString(),
    dryRun,
    input,
    changes,
    written,
  };
  const reportDir = path.join(root, ".mcp", "reports", "model-health");
  const reportPath = path.join(reportDir, `${report.id}.json`);
  if (!dryRun) {
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  }

  return { ok: true, dryRun, target: input.applyTarget, written, changes, reportPath: dryRun ? undefined : reportPath };
}
