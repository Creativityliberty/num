import fs from "node:fs";
import path from "node:path";
function nowMs() {
    return Date.now();
}
function parseRange(range) {
    if (range === "all")
        return 0;
    if (range === "30d")
        return 30 * 24 * 3600 * 1000;
    return 7 * 24 * 3600 * 1000;
}
function safeReadJson(p) {
    try {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
    catch {
        return null;
    }
}
export function computeScoring(root, range, q, tagContains) {
    const dir = path.join(root, ".mcp", "runs");
    if (!fs.existsSync(dir))
        return [];
    const cutoff = parseRange(range || "7d");
    const minTs = cutoff ? nowMs() - cutoff : 0;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    const map = new Map();
    for (const f of files) {
        const p = path.join(dir, f);
        const j = safeReadJson(p);
        if (!j)
            continue;
        const ts = Date.parse(j.ts || j.startedAt || j.createdAt || "") || 0;
        if (minTs && ts && ts < minTs)
            continue;
        const modeId = j.modeId || j.mode || j.state?.modeId || j.record?.modeId;
        if (!modeId || typeof modeId !== "string")
            continue;
        const state = j.state?.current || j.state || j.status || j.currentState;
        const s = typeof state === "string" ? state : state?.name || state?.state || "";
        const status = String(s || "").toUpperCase();
        const tagsArr = (j.tags || j.modeTags || j.record?.tags || []);
        const tags = new Set((Array.isArray(tagsArr) ? tagsArr : []).map((x) => String(x)));
        if (!map.has(modeId))
            map.set(modeId, { runs: 0, done: 0, failed: 0, cancelled: 0, totalMs: 0, countedMs: 0, tags });
        const row = map.get(modeId);
        row.runs += 1;
        for (const t of tags)
            row.tags.add(t);
        if (status.includes("DONE"))
            row.done += 1;
        else if (status.includes("FAIL"))
            row.failed += 1;
        else if (status.includes("CANCEL"))
            row.cancelled += 1;
        const dur = j.durationMs ?? j.timing?.durationMs ?? null;
        if (typeof dur === "number" && Number.isFinite(dur)) {
            row.totalMs += dur;
            row.countedMs += 1;
        }
    }
    const qq = (q || "").toLowerCase().trim();
    const tt = (tagContains || "").toLowerCase().trim();
    const out = [];
    for (const [id, v] of map.entries()) {
        const successRate = v.runs ? v.done / v.runs : null;
        const avgDurationMs = v.countedMs ? Math.round(v.totalMs / v.countedMs) : null;
        const score = v.done * 2 + v.failed * -5 + v.cancelled * -2;
        const tagStr = Array.from(v.tags).join(" ").toLowerCase();
        if (qq && !id.toLowerCase().includes(qq))
            continue;
        if (tt && !tagStr.includes(tt))
            continue;
        out.push({ id, runs: v.runs, done: v.done, failed: v.failed, cancelled: v.cancelled, score, successRate, avgDurationMs });
    }
    out.sort((a, b) => b.score - a.score || b.runs - a.runs);
    return out;
}
export function suggestAgents(scored, goal) {
    const g = (goal || "").toLowerCase();
    if (!g)
        return scored.slice(0, 5);
    const boosts = [
        { k: "security", t: ["security", "audit", "vuln"] },
        { k: "docs", t: ["docs", "readme", "documentation"] },
        { k: "ci", t: ["ci", "pipeline", "github", "actions"] },
        { k: "test", t: ["test", "vitest", "pytest", "unit"] },
        { k: "refactor", t: ["refactor", "cleanup"] },
    ];
    const boosted = scored.map((x) => {
        let b = 0;
        for (const rule of boosts) {
            if (rule.t.some((w) => g.includes(w)) && x.id.toLowerCase().includes(rule.k))
                b += 3;
        }
        return { ...x, _boost: b };
    });
    boosted.sort((a, b) => (b.score + b._boost) - (a.score + a._boost) || b.runs - a.runs);
    return boosted.slice(0, 5);
}
