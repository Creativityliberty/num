import { describe, expect, it } from "vitest";
import { computeRoleDurationsFromRun } from "../src/dashboard/data/stats.js";

describe("dashboard role duration stats (12.4)", () => {
  it("computes durations per role from jobs", () => {
    const run = {
      agents: {
        jobs: [
          { role: "planner", startedAt: "2025-01-01T00:00:00.000Z", finishedAt: "2025-01-01T00:00:01.000Z" },
          { role: "implementer", startedAt: "2025-01-01T00:00:02.000Z", finishedAt: "2025-01-01T00:00:04.000Z" },
          { role: "reviewer", startedAt: "2025-01-01T00:00:05.000Z", finishedAt: "2025-01-01T00:00:06.000Z" },
          { role: "security", startedAt: "2025-01-01T00:00:07.000Z", finishedAt: "2025-01-01T00:00:07.500Z" },
        ],
      },
    };
    const out = computeRoleDurationsFromRun(run);
    expect(out.planner?.count).toBe(1);
    expect(out.planner?.avgMs).toBe(1000);
    expect(out.implementer?.avgMs).toBe(2000);
    expect(out.reviewer?.avgMs).toBe(1000);
    expect(out.security?.avgMs).toBe(500);
  });

  it("handles missing timestamps gracefully", () => {
    const run = {
      agents: {
        jobs: [
          { role: "planner", startedAt: "2025-01-01T00:00:00.000Z" },
          { role: "implementer" },
        ],
      },
    };
    const out = computeRoleDurationsFromRun(run);
    expect(Object.keys(out).length).toBe(0);
  });

  it("handles empty jobs array", () => {
    const run = { agents: { jobs: [] } };
    const out = computeRoleDurationsFromRun(run);
    expect(Object.keys(out).length).toBe(0);
  });
});
