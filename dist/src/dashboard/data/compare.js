import { loadReplay } from "./replays.js";
import { loadRun } from "./runs.js";
export async function compareRunToReplay(workspaceRoot, runId) {
    const run = await loadRun(workspaceRoot, runId);
    const replay = (await loadReplay(workspaceRoot, runId));
    const details = {
        run: {
            state: run.state,
            modeId: run.selectedMode?.id ?? null,
            pipeline: run.pipeline ?? null,
            commands: run.runOutput?.commands ?? [],
            patchSummary: run.pipeline?.apply ?? null,
        },
        replay: {
            ok: replay.ok ?? null,
            summary: replay.summary ?? null,
            checks: replay.checks ?? [],
        },
        diffs: {},
    };
    let mismatches = 0;
    const allowCheck = (replay.checks ?? []).find((c) => c.name === "commands.allowlist");
    if (allowCheck && allowCheck.ok === false) {
        details.diffs.commandsAllowlist = { ok: false, bad: allowCheck.bad ?? [] };
        mismatches++;
    }
    else if (allowCheck) {
        details.diffs.commandsAllowlist = { ok: true };
    }
    const runApply = run.pipeline?.apply ?? null;
    const replayPatch = replay.summary?.patch ?? null;
    if (runApply && replayPatch) {
        const keys = ["filesChanged", "insertions", "deletions"];
        const delta = {};
        for (const k of keys) {
            const a = runApply[k];
            const b = replayPatch[k];
            if (a !== undefined && b !== undefined && a !== b) {
                delta[k] = { run: a, replay: b };
            }
        }
        if (Object.keys(delta).length) {
            details.diffs.patchStats = delta;
            mismatches++;
        }
        else {
            details.diffs.patchStats = { ok: true };
        }
    }
    else {
        details.diffs.patchStats = { note: "missing run.pipeline.apply or replay.summary.patch" };
    }
    return { runId, mismatches, details };
}
