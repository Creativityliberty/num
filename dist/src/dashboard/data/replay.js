import fs from "node:fs/promises";
import path from "node:path";
import { parsePatchStats, validatePatchSafety } from "../../core/patch.js";
import { loadRun } from "./runs.js";
function safeJoin(root, ...parts) {
    const absRoot = path.resolve(root);
    const p = path.resolve(absRoot, ...parts);
    if (!p.startsWith(absRoot))
        throw new Error("PATH_OUTSIDE_WORKSPACE");
    return p;
}
export async function replayDryRun(workspaceRoot, policy, runId) {
    const run = await loadRun(workspaceRoot, runId);
    const patch = run.runOutput?.patch ?? null;
    const commands = run.runOutput?.commands ?? [];
    const report = {
        runId,
        sessionId: run.sessionId,
        ok: true,
        checks: [],
        summary: {},
        wroteReportPath: null,
    };
    const allowed = policy.allowedCommands ?? [];
    if (allowed.length) {
        const bad = commands.filter((c) => !allowed.includes(c));
        if (bad.length) {
            report.ok = false;
            report.checks.push({ name: "commands.allowlist", ok: false, bad });
        }
        else {
            report.checks.push({ name: "commands.allowlist", ok: true });
        }
    }
    else {
        report.checks.push({ name: "commands.allowlist", ok: true, note: "no allowedCommands configured" });
    }
    if (patch) {
        try {
            const stats = parsePatchStats(String(patch));
            const safety = validatePatchSafety(String(patch), workspaceRoot);
            if (!safety.safe) {
                report.ok = false;
                report.checks.push({ name: "patch.safety", ok: false, message: safety.errors.join("; ") || "unsafe" });
            }
            else {
                report.checks.push({ name: "patch.parse", ok: true, files: stats.filesChanged });
                report.summary.patch = { filesChanged: stats.filesChanged, insertions: stats.insertions, deletions: stats.deletions };
            }
        }
        catch (e) {
            report.ok = false;
            const msg = e instanceof Error ? e.message : String(e);
            report.checks.push({ name: "patch.parse", ok: false, message: msg });
        }
    }
    else {
        report.ok = false;
        report.checks.push({ name: "patch.present", ok: false });
    }
    const dir = safeJoin(workspaceRoot, ".mcp", "replays");
    await fs.mkdir(dir, { recursive: true });
    const outPath = path.join(dir, `${runId}.json`);
    await fs.writeFile(outPath, JSON.stringify(report, null, 2), "utf8");
    report.wroteReportPath = outPath;
    return report;
}
