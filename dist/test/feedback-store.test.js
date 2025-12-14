import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FeedbackStore } from "../src/core/feedback.store.js";
describe("13.3 feedback store", () => {
    it("appends and reads feedback", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-feedback-"));
        const store = new FeedbackStore(tmp);
        await store.append({
            modeId: "num:code-fix",
            runId: "run-1",
            success: true,
            costUsd: 0.5,
            durationMs: 5000,
            ts: new Date().toISOString(),
        });
        await store.append({
            modeId: "num:code-fix",
            runId: "run-2",
            success: false,
            costUsd: 0.3,
            durationMs: 3000,
            rolledBack: true,
            ts: new Date().toISOString(),
        });
        const all = await store.readAll();
        expect(all.length).toBe(2);
        expect(all[0]?.modeId).toBe("num:code-fix");
        expect(all[1]?.rolledBack).toBe(true);
    });
    it("computes stats for a mode", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-feedback-"));
        const store = new FeedbackStore(tmp);
        // 3 runs: 2 success, 1 fail with rollback
        await store.append({ modeId: "num:test", runId: "r1", success: true, costUsd: 1.0, durationMs: 1000, ts: new Date().toISOString() });
        await store.append({ modeId: "num:test", runId: "r2", success: true, costUsd: 2.0, durationMs: 2000, ts: new Date().toISOString() });
        await store.append({ modeId: "num:test", runId: "r3", success: false, costUsd: 0.5, durationMs: 500, rolledBack: true, ts: new Date().toISOString() });
        const stats = await store.computeStats("num:test");
        expect(stats.totalRuns).toBe(3);
        expect(stats.successCount).toBe(2);
        expect(stats.failCount).toBe(1);
        expect(stats.rollbackCount).toBe(1);
        expect(stats.successRate).toBeCloseTo(0.667, 2);
        expect(stats.rollbackRate).toBeCloseTo(0.333, 2);
        expect(stats.avgCostUsd).toBeCloseTo(1.167, 2);
        expect(stats.avgDurationMs).toBeCloseTo(1166.67, 0);
    });
    it("returns empty stats for unknown mode", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-feedback-"));
        const store = new FeedbackStore(tmp);
        const stats = await store.computeStats("unknown");
        expect(stats.totalRuns).toBe(0);
        expect(stats.successRate).toBe(0);
    });
    it("computes all stats", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-feedback-"));
        const store = new FeedbackStore(tmp);
        await store.append({ modeId: "mode-a", runId: "r1", success: true, ts: new Date().toISOString() });
        await store.append({ modeId: "mode-b", runId: "r2", success: false, ts: new Date().toISOString() });
        const allStats = await store.computeAllStats();
        expect(allStats.length).toBe(2);
        expect(allStats.find((s) => s.modeId === "mode-a")?.successRate).toBe(1);
        expect(allStats.find((s) => s.modeId === "mode-b")?.successRate).toBe(0);
    });
});
//# sourceMappingURL=feedback-store.test.js.map