import crypto from "node:crypto";
import { writeReport } from "./reports.js";
const DEFAULT_CHEFS = [
    "num:orchestrator",
    "num:workflow-orchestrator",
    "num:agent-organizer",
    "num:error-coordinator",
    "num:performance-monitor",
    "num:knowledge-synthesizer",
];
function uniq(arr) {
    return Array.from(new Set(arr));
}
function pickN(arr, n) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.slice(0, Math.max(0, n));
}
export function selectSmokeModes(opts) {
    const prefix = opts.input.modePrefix ?? "num:";
    const onlyNum = opts.allModes.filter((m) => m.id.startsWith(prefix));
    const chefs = DEFAULT_CHEFS.filter((id) => onlyNum.some((m) => m.id === id));
    let pool = onlyNum.map((m) => m.id);
    if (opts.input.strategy === "by-tags" && opts.input.tags?.length) {
        const tagSet = new Set(opts.input.tags.map((t) => t.toLowerCase()));
        pool = onlyNum
            .filter((m) => (m.tags ?? []).some((t) => tagSet.has(String(t).toLowerCase())))
            .map((m) => m.id);
    }
    const sample = Math.max(0, opts.input.sample ?? 10);
    if (opts.input.strategy === "core+chefs") {
        const remaining = sample - chefs.length;
        const byTag = (tag) => onlyNum.filter((m) => (m.tags ?? []).includes(tag)).map((m) => m.id);
        const command = byTag("command");
        const browser = byTag("browser");
        const mcp = byTag("mcp");
        const rest = pool.filter((id) => !command.includes(id) &&
            !browser.includes(id) &&
            !mcp.includes(id) &&
            !chefs.includes(id));
        const picked = uniq([
            ...chefs,
            ...pickN(command.filter((id) => !chefs.includes(id)), Math.floor(remaining * 0.35)),
            ...pickN(browser.filter((id) => !chefs.includes(id)), Math.floor(remaining * 0.25)),
            ...pickN(mcp.filter((id) => !chefs.includes(id)), Math.floor(remaining * 0.2)),
            ...pickN(rest, Math.max(0, remaining)),
        ]);
        return { chefs, selected: picked.slice(0, sample) };
    }
    const picked = uniq([
        ...chefs,
        ...pickN(pool.filter((id) => !chefs.includes(id)), Math.max(0, sample - chefs.length)),
    ]);
    return { chefs, selected: picked.slice(0, sample) };
}
export async function runSmoke(opts) {
    const ts = new Date().toISOString();
    const smokeId = `smoke-${ts.replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;
    const { chefs, selected } = selectSmokeModes({
        allModes: opts.allModes,
        input: opts.input,
    });
    const results = [];
    for (const modeId of selected) {
        if (opts.input.dryRun) {
            try {
                await opts.validateOne(modeId);
                await opts.simulateOne(modeId);
                results.push({ modeId, ok: true, state: "DRY_OK" });
            }
            catch (e) {
                const err = e;
                results.push({
                    modeId,
                    ok: false,
                    state: "DRY_FAIL",
                    error: String(err?.message ?? e),
                });
            }
            continue;
        }
        if (!opts.runOne) {
            results.push({
                modeId,
                ok: false,
                state: "NO_RUNNER",
                error: "Server runOne not configured",
            });
            continue;
        }
        try {
            const r = await opts.runOne(modeId, opts.input);
            results.push({
                modeId,
                ok: !!r.ok,
                state: r.state,
                runId: r.runId,
                error: r.error ? String(r.error?.message ?? r.error) : undefined,
                blockedByPolicy: r.blockedByPolicy,
            });
        }
        catch (e) {
            const err = e;
            results.push({
                modeId,
                ok: false,
                state: "FAILED",
                error: String(err?.message ?? e),
            });
        }
    }
    const summary = {
        total: results.length,
        ok: results.filter((r) => r.ok).length,
        failed: results.filter((r) => !r.ok && !r.blockedByPolicy).length,
        blocked: results.filter((r) => !!r.blockedByPolicy).length,
    };
    const report = {
        ok: true,
        ts,
        smokeId,
        input: opts.input,
        selected,
        chefs,
        results,
        summary,
    };
    const file = writeReport(opts.root, "smoke", smokeId, report);
    return { smokeId, file, report };
}
