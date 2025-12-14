import { describe, expect, it } from "vitest";
import { buildJobsTimeline } from "../src/dashboard/data/timeline.js";
describe("12.5 timeline/bottlenecks", () => {
    it("computes bottleneck role by totalMs", () => {
        const run = {
            agents: {
                jobs: [
                    { jobId: "a", role: "planner", status: "done", startedAt: "2025-01-01T00:00:00.000Z", finishedAt: "2025-01-01T00:00:01.000Z" },
                    { jobId: "b", role: "implementer", status: "done", startedAt: "2025-01-01T00:00:01.000Z", finishedAt: "2025-01-01T00:00:06.000Z" },
                ],
            },
        };
        const tl = buildJobsTimeline(run);
        expect(tl.bottleneckRole).toBe("implementer");
        expect(tl.bottleneckTotalMs).toBe(5000);
    });
    it("groups jobs by role into lanes", () => {
        const run = {
            agents: {
                jobs: [
                    { jobId: "p1", role: "planner", status: "done", startedAt: "2025-01-01T00:00:00.000Z", finishedAt: "2025-01-01T00:00:02.000Z" },
                    { jobId: "i1", role: "implementer", status: "done", startedAt: "2025-01-01T00:00:02.000Z", finishedAt: "2025-01-01T00:00:05.000Z" },
                    { jobId: "r1", role: "reviewer", status: "done", startedAt: "2025-01-01T00:00:05.000Z", finishedAt: "2025-01-01T00:00:06.000Z" },
                ],
            },
        };
        const tl = buildJobsTimeline(run);
        expect(tl.lanes.length).toBe(3);
        expect(tl.lanes[0]?.role).toBe("implementer"); // longest
    });
    it("handles empty jobs", () => {
        const run = { agents: { jobs: [] } };
        const tl = buildJobsTimeline(run);
        expect(tl.bottleneckRole).toBeNull();
        expect(tl.lanes.length).toBe(0);
    });
    it("computes minMs and maxMs", () => {
        const run = {
            agents: {
                jobs: [
                    { jobId: "a", role: "planner", status: "done", startedAt: "2025-01-01T00:00:00.000Z", finishedAt: "2025-01-01T00:00:10.000Z" },
                ],
            },
        };
        const tl = buildJobsTimeline(run);
        expect(tl.minMs).toBe(Date.parse("2025-01-01T00:00:00.000Z"));
        expect(tl.maxMs).toBe(Date.parse("2025-01-01T00:00:10.000Z"));
    });
});
//# sourceMappingURL=dashboard-timeline.test.js.map