import fs from "node:fs/promises";
import path from "node:path";
import { ModeFeedbackSchema, ModeStatsSchema } from "./feedback.schema.js";
export class FeedbackStore {
    root;
    constructor(root) {
        this.root = root;
    }
    file() {
        return path.join(this.root, ".mcp", "feedback.jsonl");
    }
    async append(fb) {
        await fs.mkdir(path.dirname(this.file()), { recursive: true });
        await fs.appendFile(this.file(), JSON.stringify(ModeFeedbackSchema.parse(fb)) + "\n");
    }
    async readAll() {
        try {
            const raw = await fs.readFile(this.file(), "utf-8");
            return raw
                .trim()
                .split("\n")
                .filter((l) => l.length > 0)
                .map((l) => ModeFeedbackSchema.parse(JSON.parse(l)));
        }
        catch {
            return [];
        }
    }
    async computeStats(modeId) {
        const all = await this.readAll();
        const forMode = all.filter((f) => f.modeId === modeId);
        if (forMode.length === 0) {
            return ModeStatsSchema.parse({
                modeId,
                totalRuns: 0,
                successCount: 0,
                failCount: 0,
                rollbackCount: 0,
                successRate: 0,
                rollbackRate: 0,
            });
        }
        const successCount = forMode.filter((f) => f.success).length;
        const failCount = forMode.filter((f) => !f.success).length;
        const rollbackCount = forMode.filter((f) => f.rolledBack).length;
        const costs = forMode.filter((f) => f.costUsd !== undefined).map((f) => f.costUsd);
        const durations = forMode.filter((f) => f.durationMs !== undefined).map((f) => f.durationMs);
        return ModeStatsSchema.parse({
            modeId,
            totalRuns: forMode.length,
            successCount,
            failCount,
            rollbackCount,
            successRate: successCount / forMode.length,
            rollbackRate: rollbackCount / forMode.length,
            avgCostUsd: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : undefined,
            avgDurationMs: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : undefined,
        });
    }
    async computeAllStats() {
        const all = await this.readAll();
        const modeIds = [...new Set(all.map((f) => f.modeId))];
        const stats = [];
        for (const modeId of modeIds) {
            stats.push(await this.computeStats(modeId));
        }
        return stats;
    }
}
