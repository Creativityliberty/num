function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9_./-]+/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}
function uniq(arr) {
    return Array.from(new Set(arr));
}
function hasAny(hay, needles) {
    const set = new Set(hay);
    return needles.some((n) => set.has(n));
}
function scoreMode(mode, task) {
    const why = [];
    let score = 0;
    const goalTokens = tokenize(task.goal);
    const errTokens = tokenize(task.context?.errors ?? "");
    const diffTokens = tokenize(task.context?.diff ?? "");
    const fileTokens = uniq((task.context?.openFiles ?? []).flatMap((p) => tokenize(p)));
    const modeText = [
        mode.id,
        mode.name,
        mode.description ?? "",
        ...(mode.tags ?? []),
        ...(mode.categoryPath ?? []),
        mode.prompts.system ?? "",
        mode.prompts.developer ?? "",
    ].join(" ");
    const modeTokens = tokenize(modeText);
    // Base: direct matches goal <-> mode tokens
    const overlapGoal = goalTokens.filter((t) => modeTokens.includes(t)).length;
    if (overlapGoal > 0) {
        score += Math.min(20, overlapGoal * 2);
        why.push(`goal↔mode token overlap +${Math.min(20, overlapGoal * 2)}`);
    }
    // Tag/category boosts
    const tagSet = (mode.tags ?? []).map((t) => t.toLowerCase());
    const cat0 = mode.categoryPath?.[0]?.toLowerCase();
    const keywordBoosts = [
        // bugfix / errors
        [["bug", "bugfix", "fix", "error", "exception", "stacktrace", "crash", "failing", "fails", "failed", "test"], 12, "bugfix keywords"],
        // tests
        [["test", "tests", "jest", "pytest", "vitest", "mocha", "coverage", "unit", "integration", "e2e"], 10, "test keywords"],
        // refactor
        [["refactor", "cleanup", "restructure", "rename", "deadcode", "debt"], 9, "refactor keywords"],
        // performance
        [["perf", "performance", "slow", "latency", "optimize", "profil", "profiling"], 8, "perf keywords"],
        // security
        [["security", "vuln", "vulnerability", "cve", "xss", "csrf", "sqli", "audit"], 11, "security keywords"],
        // docs
        [["doc", "docs", "readme", "documentation", "md"], 7, "docs keywords"],
        // release
        [["release", "changelog", "version", "tag", "publish"], 7, "release keywords"],
    ];
    const allTaskTokens = uniq([...goalTokens, ...errTokens, ...diffTokens, ...fileTokens]);
    for (const [keys, pts, label] of keywordBoosts) {
        if (hasAny(allTaskTokens, keys)) {
            // if mode seems aligned (by tag/category/id/name)
            const aligned = hasAny(tagSet, keys) ||
                (cat0 ? keys.includes(cat0) : false) ||
                keys.some((k) => mode.id.toLowerCase().includes(k) || mode.name.toLowerCase().includes(k));
            if (aligned) {
                score += pts;
                why.push(`${label} aligned +${pts}`);
            }
            else {
                score += Math.floor(pts / 3);
                why.push(`${label} weak +${Math.floor(pts / 3)}`);
            }
        }
    }
    // Stack / language hints
    const stack = (task.context?.techStack ?? []).map((s) => s.toLowerCase());
    if (stack.length) {
        const stackMatches = stack.filter((s) => modeTokens.includes(s) || tagSet.includes(s)).length;
        if (stackMatches > 0) {
            const pts = Math.min(10, stackMatches * 4);
            score += pts;
            why.push(`techStack match +${pts}`);
        }
    }
    // File extension hints
    const openFiles = task.context?.openFiles ?? [];
    const extHints = openFiles.map((p) => (p.split(".").pop() ?? "").toLowerCase()).filter(Boolean);
    if (extHints.length) {
        const extToTag = {
            ts: ["typescript", "ts", "node"],
            js: ["javascript", "js", "node"],
            py: ["python", "py"],
            go: ["go", "golang"],
            java: ["java"],
            rs: ["rust"],
            rb: ["ruby"],
            php: ["php"],
            md: ["docs", "documentation", "readme"],
        };
        let extPts = 0;
        for (const ext of uniq(extHints)) {
            const tags = extToTag[ext];
            if (!tags)
                continue;
            if (tags.some((t) => tagSet.includes(t) || modeTokens.includes(t)))
                extPts += 3;
        }
        if (extPts) {
            score += Math.min(9, extPts);
            why.push(`openFiles ext hints +${Math.min(9, extPts)}`);
        }
    }
    // Small preference: "orchestrator" mode only if explicitly asked
    if (mode.id.toLowerCase().includes("orchestr")) {
        const asked = allTaskTokens.includes("orchestrator") || allTaskTokens.includes("orchestration");
        if (!asked) {
            score -= 8;
            why.push("penalty: orchestrator mode not explicitly requested -8");
        }
    }
    return { score, why };
}
function toConfidence(score) {
    // squashing: score 0 -> ~0.05, 30 -> ~0.65, 60 -> ~0.9
    const c = 1 / (1 + Math.exp(-(score - 30) / 10));
    return Math.max(0, Math.min(1, c));
}
export function suggestModes(allModes, task, topK) {
    const scored = allModes
        .map((m) => {
        const { score, why } = scoreMode(m, task);
        return {
            modeId: m.id,
            score,
            confidence: toConfidence(score),
            rationale: why,
        };
    })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    // If everything is flat/low, still return best guess
    return scored;
}
