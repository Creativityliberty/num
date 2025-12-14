import { replayDryRun } from "./replay.js";
import { listRuns } from "./runs.js";
export async function replayLatestDoneRuns(workspaceRoot, policy, limit) {
    const runs = await listRuns(workspaceRoot);
    const done = runs.filter((r) => r.state === "DONE").slice(0, Math.max(1, Math.min(50, limit)));
    const results = [];
    let ok = 0;
    let fail = 0;
    for (const r of done) {
        try {
            const rep = await replayDryRun(workspaceRoot, policy, r.runId);
            results.push({ runId: r.runId, ok: !!rep.ok, wroteReportPath: rep.wroteReportPath ?? undefined });
            if (rep.ok)
                ok++;
            else
                fail++;
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ runId: r.runId, ok: false, error: msg });
            fail++;
        }
    }
    return {
        summary: { total: done.length, ok, fail },
        results,
    };
}
