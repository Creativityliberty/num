import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { ModelTelemetryEventSchema, OrchestrateRunRecordSchema } from "../../core/schemas.js";
export function newRunId() {
    return crypto.randomUUID();
}
function runsDir(policy) {
    return path.join(path.resolve(policy.workspaceRoot), ".mcp", "runs");
}
export async function ensureRunsDir(policy) {
    await fs.mkdir(runsDir(policy), { recursive: true });
}
export function runPath(policy, runId) {
    return path.join(runsDir(policy), `${runId}.json`);
}
export async function saveRun(policy, run) {
    await ensureRunsDir(policy);
    const parsed = OrchestrateRunRecordSchema.parse(run);
    const p = runPath(policy, parsed.runId);
    await fs.writeFile(p, JSON.stringify(parsed, null, 2), "utf8");
}
export async function loadRun(policy, runId) {
    const p = runPath(policy, runId);
    const raw = await fs.readFile(p, "utf8");
    const json = JSON.parse(raw);
    return OrchestrateRunRecordSchema.parse(json);
}
export async function tryLoadRun(policy, runId) {
    try {
        return await loadRun(policy, runId);
    }
    catch {
        return null;
    }
}
// 19.3: Append telemetry event to run record
export async function appendTelemetry(policy, runId, event) {
    const ev = ModelTelemetryEventSchema.parse(event);
    const run = await loadRun(policy, runId);
    const telemetry = Array.isArray(run.telemetry) ? run.telemetry : [];
    telemetry.push(ev);
    await saveRun(policy, { ...run, telemetry });
    return { ok: true, count: telemetry.length };
}
