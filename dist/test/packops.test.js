import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runPackOps } from "../src/dashboard/data/packops.js";
describe("20.1 packops", () => {
    it("writes report with stats", async () => {
        const root = path.join(process.cwd(), ".tmp-packops");
        fs.rmSync(root, { recursive: true, force: true });
        fs.mkdirSync(root, { recursive: true });
        const validateOne = async (id) => id.includes("bad") ? { ok: false, code: "INVALID" } : { ok: true };
        const simulateOne = async (id) => {
            if (id.includes("simfail"))
                throw new Error("boom");
            return { ok: true, ticks: 3, parallelGroups: [] };
        };
        const r = await runPackOps({
            root,
            packId: "num-pack",
            modeIds: ["num:good", "num:bad", "num:simfail"],
            validateOne,
            simulateOne,
        });
        expect(r.report.stats.total).toBe(3);
        expect(r.report.stats.invalid).toBe(1);
        expect(r.report.stats.simulateFailed).toBe(1);
        expect(fs.existsSync(r.file)).toBe(true);
        fs.rmSync(root, { recursive: true, force: true });
    });
});
//# sourceMappingURL=packops.test.js.map