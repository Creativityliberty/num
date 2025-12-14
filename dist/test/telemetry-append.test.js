import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appendTelemetry, saveRun } from "../src/server/orchestrator/store.js";
describe("19.3 telemetry append", () => {
    const tmpRoot = path.join(process.cwd(), ".tmp-test-telemetry-" + Date.now());
    const policy = {
        workspaceRoot: tmpRoot,
        allowWrite: true,
        allowExec: false,
        allowGit: false,
        maxPatchBytes: 2_000_000,
        maxFilesChanged: 400,
        allowedCommands: [],
        exec: { allowedExecutables: [], allowedArgs: {} },
        allowedWritePaths: [],
        blockedWritePaths: [".git/**", "node_modules/**"],
        requireConfirmationFor: [],
        rollbackCooldownSeconds: 300,
        git: { allowedBranchPrefixes: [], allowCommit: false, commitMessagePattern: "^.{5,120}$", allowPush: false },
    };
    beforeEach(async () => {
        await fs.rm(tmpRoot, { recursive: true, force: true });
        await fs.mkdir(path.join(tmpRoot, ".mcp", "runs"), { recursive: true });
    });
    afterEach(async () => {
        await fs.rm(tmpRoot, { recursive: true, force: true });
    });
    it("appends telemetry into run record", async () => {
        await saveRun(policy, {
            runId: "r1",
            sessionId: "s1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            state: "INIT",
            task: { goal: "test" },
            flow: {},
        });
        const r = await appendTelemetry(policy, "r1", {
            ts: new Date().toISOString(),
            runId: "r1",
            stepId: "plan",
            chosenModel: { provider: "openai", model: "gpt-4.1-mini" },
            attempts: [{ model: { provider: "openai", model: "gpt-4.1-mini" }, ok: true }],
        });
        expect(r.ok).toBe(true);
        expect(r.count).toBe(1);
        const raw = JSON.parse(await fs.readFile(path.join(tmpRoot, ".mcp", "runs", "r1.json"), "utf-8"));
        expect(raw.telemetry.length).toBe(1);
        expect(raw.telemetry[0].stepId).toBe("plan");
    });
    it("appends multiple telemetry events", async () => {
        await saveRun(policy, {
            runId: "r2",
            sessionId: "s2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            state: "INIT",
            task: { goal: "test" },
            flow: {},
        });
        await appendTelemetry(policy, "r2", {
            ts: new Date().toISOString(),
            runId: "r2",
            stepId: "plan",
            chosenModel: { provider: "openai", model: "gpt-4.1" },
            attempts: [{ model: { provider: "openai", model: "gpt-4.1" }, ok: true }],
        });
        const r2 = await appendTelemetry(policy, "r2", {
            ts: new Date().toISOString(),
            runId: "r2",
            stepId: "run",
            role: "implementer",
            chosenModel: { provider: "anthropic", model: "claude-3-5-sonnet-latest" },
            attempts: [
                { model: { provider: "openai", model: "gpt-4.1" }, ok: false, reason: "429 Rate limit", transient: true },
                { model: { provider: "anthropic", model: "claude-3-5-sonnet-latest" }, ok: true },
            ],
            usage: { inputTokens: 1000, outputTokens: 500 },
        });
        expect(r2.count).toBe(2);
        const raw = JSON.parse(await fs.readFile(path.join(tmpRoot, ".mcp", "runs", "r2.json"), "utf-8"));
        expect(raw.telemetry.length).toBe(2);
        expect(raw.telemetry[1].attempts.length).toBe(2);
        expect(raw.telemetry[1].attempts[0].transient).toBe(true);
    });
});
//# sourceMappingURL=telemetry-append.test.js.map