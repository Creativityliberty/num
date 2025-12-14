import fs from "node:fs";
import path from "node:path";
function readJson(p) {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
}
function writeJson(p, obj) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}
function sameModel(a, b) {
    if (!a || !b)
        return false;
    return a.provider === b.provider && a.model === b.model;
}
function ensureArr(v) {
    return Array.isArray(v) ? v : [];
}
function nowId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}
function findModeFile(modesDir, modeId) {
    const slug = String(modeId).includes(":") ? String(modeId).split(":")[1] : String(modeId);
    return path.join(modesDir, `${slug}.json`);
}
export function applyModelFallbackSuggestion(root, input) {
    const dryRun = !!input.dryRun;
    const changes = [];
    const written = [];
    if (input.applyTarget === "packDefaults") {
        const packJsonPath = path.join(root, input.packDir, "pack.json");
        const before = readJson(packJsonPath);
        const after = structuredClone(before);
        after.runtimePolicy = after.runtimePolicy ?? {};
        const rp = after.runtimePolicy;
        rp.defaults = rp.defaults ?? {};
        const defaults = rp.defaults;
        defaults.model = defaults.model ?? {};
        const model = defaults.model;
        if (!model.preferred) {
            model.preferred = input.from;
        }
        const fallbacks = ensureArr(model.fallbacks);
        const filtered = fallbacks.filter((m) => !sameModel(m, input.from));
        const nextFallbacks = [input.to, ...filtered].filter((m, idx, arr) => {
            return idx === arr.findIndex((x) => sameModel(x, m));
        });
        model.fallbacks = nextFallbacks;
        changes.push({ file: packJsonPath, before: before.runtimePolicy ?? null, after: after.runtimePolicy ?? null });
        if (!dryRun) {
            writeJson(packJsonPath, after);
            written.push(packJsonPath);
        }
    }
    else {
        if (!input.modesDir)
            throw new Error("modesDir required for applyTarget=mode");
        if (!input.modeId)
            throw new Error("modeId required for applyTarget=mode");
        const modePath = findModeFile(path.join(root, input.modesDir), input.modeId);
        const before = readJson(modePath);
        const after = structuredClone(before);
        after.runtimePolicy = after.runtimePolicy ?? {};
        const rp = after.runtimePolicy;
        rp.model = rp.model ?? {};
        const model = rp.model;
        const fallbacks = ensureArr(model.fallbacks);
        const filtered = fallbacks.filter((m) => !sameModel(m, input.from));
        const nextFallbacks = [input.to, ...filtered].filter((m, idx, arr) => {
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
