import { listRuns, loadRun } from "./runs.js";
// 12.4: helper for role duration stats
function toMs(ts) {
    if (!ts)
        return null;
    const t = new Date(ts).getTime();
    return Number.isFinite(t) ? t : null;
}
function summarizeArr(values) {
    const v = values.filter((x) => Number.isFinite(x) && x >= 0).sort((a, b) => a - b);
    if (v.length === 0)
        return { count: 0, avgMs: 0, p50Ms: 0, p95Ms: 0 };
    const sum = v.reduce((a, b) => a + b, 0);
    const p50Idx = Math.max(0, Math.min(v.length - 1, Math.floor(0.5 * (v.length - 1))));
    const p95Idx = Math.max(0, Math.min(v.length - 1, Math.floor(0.95 * (v.length - 1))));
    return {
        count: v.length,
        avgMs: Math.round(sum / v.length),
        p50Ms: Math.round(v[p50Idx]),
        p95Ms: Math.round(v[p95Idx]),
    };
}
export function computeRoleDurationsFromRun(run) {
    const jobs = run?.agents?.jobs ?? [];
    const byRole = {};
    for (const j of jobs) {
        const role = String(j.role ?? "unknown");
        const s = toMs(j.startedAt);
        const f = toMs(j.finishedAt);
        if (s == null || f == null)
            continue;
        const d = f - s;
        if (d < 0)
            continue;
        byRole[role] = byRole[role] ?? [];
        byRole[role].push(d);
    }
    const out = {};
    for (const [role, arr] of Object.entries(byRole))
        out[role] = summarizeArr(arr);
    return out;
}
function inRange(ts, range) {
    if (range === "all")
        return true;
    const t = new Date(ts).getTime();
    const now = Date.now();
    const ms = range === "24h" ? 24 * 3600 * 1000 :
        range === "7d" ? 7 * 24 * 3600 * 1000 :
            range === "30d" ? 30 * 24 * 3600 * 1000 : 365 * 24 * 3600 * 1000;
    return now - t <= ms;
}
function quantile(nums, q) {
    if (!nums.length)
        return 0;
    const a = nums.slice().sort((x, y) => x - y);
    const pos = (a.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    const next = a[base + 1] ?? a[base];
    return Math.round(a[base] + rest * (next - a[base]));
}
function median(nums) {
    if (!nums.length)
        return 0;
    return quantile(nums, 0.5);
}
export async function computeStats(workspaceRoot, range) {
    const items = await listRuns(workspaceRoot);
    const filtered = items.filter((r) => inRange(r.updatedAt, range));
    const states = {};
    const modeCounts = {};
    const cmdCounts = {};
    const durations = {
        planMs: [],
        runMs: [],
        reviewMs: [],
        applyAndVerifyMs: [],
    };
    for (const it of filtered) {
        states[it.state] = (states[it.state] ?? 0) + 1;
        const m = it.modeId ?? "unknown";
        modeCounts[m] = (modeCounts[m] ?? 0) + 1;
        try {
            const run = await loadRun(workspaceRoot, it.runId);
            const hist = run.history ?? [];
            const findTs = (toState) => hist.find((h) => h.to === toState)?.ts;
            const tsNeedsPlan = findTs("NEEDS_PLAN");
            const tsNeedsPatch = findTs("NEEDS_PATCH");
            const tsNeedsReview = findTs("NEEDS_REVIEW");
            const tsReady = findTs("READY_TO_APPLY");
            const tsApplied = findTs("APPLIED_AND_VERIFIED");
            const t = (x) => (x ? new Date(x).getTime() : null);
            const a = t(tsNeedsPlan), b = t(tsNeedsPatch), c = t(tsNeedsReview), d = t(tsReady), e = t(tsApplied);
            if (a && b && b > a)
                durations.planMs.push(b - a);
            if (b && c && c > b)
                durations.runMs.push(c - b);
            else if (b && d && d > b)
                durations.runMs.push(d - b);
            if (c && d && d > c)
                durations.reviewMs.push(d - c);
            if (d && e && e > d)
                durations.applyAndVerifyMs.push(e - d);
            const exec = run.pipeline?.exec ?? [];
            for (const x of exec) {
                const cmd = String(x.command ?? "");
                if (!cmd)
                    continue;
                const cur = cmdCounts[cmd] ?? { count: 0, fail: 0 };
                cur.count += 1;
                if (Number(x.exitCode ?? 0) !== 0)
                    cur.fail += 1;
                cmdCounts[cmd] = cur;
            }
        }
        catch {
            // ignore
        }
    }
    const total = filtered.length;
    const done = states["DONE"] ?? 0;
    const successRatePct = total ? (done / total) * 100 : 0;
    const topModes = Object.entries(modeCounts)
        .map(([modeId, count]) => ({ modeId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const topCommands = Object.entries(cmdCounts)
        .map(([command, v]) => ({
        command,
        count: v.count,
        failRatePct: v.count ? (v.fail / v.count) * 100 : 0,
    }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const avgDurationsMs = {};
    for (const [k, arr] of Object.entries(durations)) {
        const sum = arr.reduce((s, x) => s + x, 0);
        avgDurationsMs[k] = {
            avg: arr.length ? Math.round(sum / arr.length) : 0,
            p50: median(arr),
            p95: quantile(arr, 0.95),
        };
    }
    // 12.4: role duration stats across runs
    const roleSamples = {};
    for (const it of filtered) {
        try {
            const run = await loadRun(workspaceRoot, it.runId);
            const jobs = run?.agents?.jobs ?? [];
            for (const j of jobs) {
                const role = String(j.role ?? "unknown");
                const s = toMs(j.startedAt);
                const f = toMs(j.finishedAt);
                if (s == null || f == null)
                    continue;
                const d = f - s;
                if (d < 0)
                    continue;
                roleSamples[role] = roleSamples[role] ?? [];
                roleSamples[role].push(d);
            }
        }
        catch {
            // ignore
        }
    }
    const roleDurations = {};
    for (const [role, arr] of Object.entries(roleSamples))
        roleDurations[role] = summarizeArr(arr);
    return {
        range,
        total,
        states,
        successRatePct,
        topModes,
        topCommands,
        avgDurationsMs,
        roleDurations,
    };
}
