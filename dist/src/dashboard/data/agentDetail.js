import fs from "node:fs";
import path from "node:path";
export async function getAgentDetail(registry, modeId) {
    const mode = await registry.get(modeId);
    if (!mode)
        return null;
    return {
        id: modeId,
        name: mode.name,
        tags: mode.tags,
        status: "valid",
        isChef: false,
        flow: mode.flow,
        runtimePolicy: mode.runtimePolicy,
        lastRuns: [],
        healthMetrics: {
            successRate: 0.95,
            avgDuration: 2300,
            modelUsage: { preferred: 0.85, fallback: 0.15 },
            costPerRun: 0.35,
        },
    };
}
export function getAgentRuns(root, modeId, limit = 5) {
    const runsDir = path.join(root, ".mcp", "runs");
    if (!fs.existsSync(runsDir))
        return [];
    const files = fs.readdirSync(runsDir).filter((f) => f.endsWith(".json"));
    const runs = [];
    for (const f of files) {
        try {
            const content = fs.readFileSync(path.join(runsDir, f), "utf-8");
            const run = JSON.parse(content);
            if (run.modeId === modeId || run.mode === modeId) {
                const state = run.state;
                runs.push({
                    id: f.replace(".json", ""),
                    status: state?.current || run.status || "unknown",
                    duration: run.durationMs || 0,
                    modelUsed: run.modelUsed || "unknown",
                    date: run.ts || run.startedAt || new Date().toISOString(),
                });
            }
        }
        catch {
            // skip corrupt files
        }
    }
    return runs.slice(0, limit);
}
export function getAgentHealth(root, modeId) {
    const runsDir = path.join(root, ".mcp", "runs");
    if (!fs.existsSync(runsDir)) {
        return {
            successRate: 0,
            avgDuration: 0,
            modelUsage: { preferred: 0, fallback: 0 },
            costPerRun: 0,
            summary: { runs: 0, success: 0, failed: 0 },
        };
    }
    const files = fs.readdirSync(runsDir).filter((f) => f.endsWith(".json"));
    let total = 0, success = 0, failed = 0, totalDuration = 0, countDuration = 0;
    for (const f of files) {
        try {
            const content = fs.readFileSync(path.join(runsDir, f), "utf-8");
            const run = JSON.parse(content);
            if (run.modeId === modeId || run.mode === modeId) {
                total++;
                const state = run.state;
                const status = String(state?.current || run.status || "").toUpperCase();
                if (status.includes("DONE"))
                    success++;
                else if (status.includes("FAIL"))
                    failed++;
                const dur = run.durationMs || 0;
                if (dur > 0) {
                    totalDuration += dur;
                    countDuration++;
                }
            }
        }
        catch {
            // skip
        }
    }
    return {
        successRate: total > 0 ? success / total : 0,
        avgDuration: countDuration > 0 ? Math.round(totalDuration / countDuration) : 0,
        modelUsage: { preferred: 0.85, fallback: 0.15 },
        costPerRun: 0.35,
        summary: { runs: total, success, failed },
    };
}
