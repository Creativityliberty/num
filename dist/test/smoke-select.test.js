import { describe, expect, it } from "vitest";
import { selectSmokeModes } from "../src/dashboard/data/smoke.js";
describe("20.2 smoke selection", () => {
    it("includes chefs when present", () => {
        const all = [
            { id: "num:orchestrator", tags: ["mcp", "chef"] },
            { id: "num:workflow-orchestrator", tags: ["read", "chef"] },
            { id: "num:agent-organizer", tags: ["command", "chef"] },
            { id: "num:random1", tags: ["browser"] },
            { id: "num:random2", tags: ["mcp"] },
        ];
        const { chefs, selected } = selectSmokeModes({
            allModes: all,
            input: { packId: "num-pack", sample: 3, strategy: "core+chefs" },
        });
        expect(chefs.length).toBeGreaterThan(0);
        expect(selected.some((id) => id.startsWith("num:"))).toBe(true);
        expect(selected.length).toBeLessThanOrEqual(3);
    });
    it("respects sample size", () => {
        const all = Array.from({ length: 20 }, (_, i) => ({
            id: `num:agent-${i}`,
            tags: ["read"],
        }));
        const { selected } = selectSmokeModes({
            allModes: all,
            input: { packId: "num-pack", sample: 5, strategy: "uniform-random" },
        });
        expect(selected.length).toBe(5);
    });
    it("filters by tags when strategy is by-tags", () => {
        const all = [
            { id: "num:browser-agent", tags: ["browser"] },
            { id: "num:command-agent", tags: ["command"] },
            { id: "num:mcp-agent", tags: ["mcp"] },
        ];
        const { selected } = selectSmokeModes({
            allModes: all,
            input: { packId: "num-pack", sample: 10, strategy: "by-tags", tags: ["browser"] },
        });
        expect(selected).toContain("num:browser-agent");
    });
});
//# sourceMappingURL=smoke-select.test.js.map