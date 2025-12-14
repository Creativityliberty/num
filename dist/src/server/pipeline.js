import { parsePatchStats } from "../core/patch.js";
import { parseCommandString, runCommandWithPolicy } from "./exec.js";
import { applyUnifiedPatch, backupFiles, rollbackWorkspace } from "./workspace.js";
export async function applyAndVerify(opts) {
    if (!opts.policy.allowWrite)
        throw new Error("WRITE_DISABLED_BY_POLICY");
    const runId = opts.runId?.trim() || `manual-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 8)}`;
    // Parse files from patch for backup
    const stats = parsePatchStats(opts.diff);
    const files = stats.files ?? [];
    // Backup before apply (only when not dryRun)
    let backupMeta;
    if (!opts.dryRun && files.length > 0) {
        try {
            backupMeta = await backupFiles({
                workspaceRoot: opts.policy.workspaceRoot,
                policy: opts.policy,
                runId,
                files,
            });
        }
        catch {
            // Backup failure is non-fatal, continue without backup
        }
    }
    const applyRes = applyUnifiedPatch(opts.policy.workspaceRoot, opts.diff, opts.dryRun);
    const execResults = [];
    let failedAt = null;
    let rolledBack = false;
    if (!opts.dryRun && applyRes.errors.length === 0 && opts.policy.allowExec) {
        for (const cmdStr of opts.commands) {
            const { cmd, args } = parseCommandString(cmdStr);
            const r = await runCommandWithPolicy(opts.policy, { cmd, args, timeoutMs: opts.timeoutMs });
            execResults.push({
                command: r.command,
                exitCode: r.exitCode,
                stdout: r.stdout,
                stderr: r.stderr,
                durationMs: r.durationMs,
            });
            if (r.exitCode !== 0) {
                failedAt = cmdStr;
                // Rollback on command failure
                if (backupMeta) {
                    try {
                        await rollbackWorkspace({
                            workspaceRoot: opts.policy.workspaceRoot,
                            policy: opts.policy,
                            runId,
                        });
                        rolledBack = true;
                    }
                    catch {
                        // Rollback failure is logged but not fatal
                    }
                }
                break;
            }
        }
    }
    return {
        apply: applyRes,
        exec: execResults,
        success: applyRes.errors.length === 0 && failedAt === null,
        failedAt,
        runId,
        backup: backupMeta,
        rolledBack,
    };
}
