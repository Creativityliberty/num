import fs from "node:fs";
import path from "node:path";
import { computeModelHealthFromEvents, loadTelemetryEvents, suggestFallbacks } from "./modelHealth.js";
import { applyModelFallbackSuggestion } from "./modelHealthApply.js";
function nowId() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}
export function batchSelectSuggestions(root, input) {
    const range = input.range ?? "7d";
    const minCalls = input.minCalls ?? 20;
    const topN = Math.max(1, Math.min(50, input.topN ?? 5));
    const events = loadTelemetryEvents(root);
    const report = computeModelHealthFromEvents(events, range);
    const suggestions = suggestFallbacks(report, minCalls);
    const filtered = input.provider ? suggestions.filter((s) => s.from.provider === input.provider) : suggestions;
    // Deduplicate by (from.provider, from.model) – keep best improvement first
    const uniq = new Map();
    for (const s of filtered) {
        const k = `${s.from.provider}:${s.from.model}`;
        if (!uniq.has(k))
            uniq.set(k, s);
    }
    const list = Array.from(uniq.values())
        .sort((a, b) => (a.metrics.fromScore - b.metrics.fromScore) || (b.metrics.toScore - a.metrics.toScore))
        .slice(0, topN)
        .map((s) => ({
        from: s.from,
        to: s.to,
        reason: s.reason,
        confidence: s.confidence,
        fromScore: s.metrics.fromScore,
        toScore: s.metrics.toScore,
    }));
    return list;
}
export function runBatchApply(root, input) {
    const dryRun = !!input.dryRun;
    const selected = batchSelectSuggestions(root, input);
    const applied = [];
    for (let i = 0; i < selected.length; i++) {
        const s = selected[i];
        try {
            const r = applyModelFallbackSuggestion(root, {
                packId: input.packId,
                packDir: input.packDir,
                modesDir: input.modesDir,
                applyTarget: input.applyTarget,
                modeId: input.modeId,
                from: s.from,
                to: s.to,
                dryRun,
            });
            applied.push({ idx: i, ok: true, written: r.written });
        }
        catch (e) {
            applied.push({ idx: i, ok: false, error: String(e instanceof Error ? e.message : e) });
        }
    }
    let reportPath = undefined;
    if (!dryRun) {
        const report = {
            id: `model-health-batch-${nowId()}`,
            ts: new Date().toISOString(),
            input,
            selected,
            applied,
        };
        const dir = path.join(root, ".mcp", "reports", "model-health-batch");
        fs.mkdirSync(dir, { recursive: true });
        reportPath = path.join(dir, `${report.id}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    }
    return { ok: true, dryRun, selected, applied, reportPath };
}
