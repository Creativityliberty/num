import { describe, expect, it } from "vitest";
import { buildJobsFromFlow, normalizeFlowSpec, renderTemplate } from "../src/server/agents/flowdsl.js";
describe("flow DSL (12.6)", () => {
    it("validates and builds jobs with deps", () => {
        const spec = normalizeFlowSpec({
            version: "1",
            name: "mini",
            nodes: [
                { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } },
                { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "s", user: "u" } },
            ],
            edges: [{ from: "a", to: "b" }],
        });
        const jobs = buildJobsFromFlow(spec);
        expect(jobs).toHaveLength(2);
        const jb = jobs.find((j) => j.jobId === "b");
        expect(jb.dependsOn).toEqual(["a"]);
    });
    it("template render supports vars + json", () => {
        const txt = renderTemplate("Goal={{task.goal}} ctx={{json task.context}}", { task: { goal: "X", context: { a: 1 } } });
        expect(txt).toContain("Goal=X");
        expect(txt).toContain('"a": 1');
    });
    it("throws on duplicate node ids", () => {
        expect(() => normalizeFlowSpec({
            version: "1",
            nodes: [
                { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } },
                { id: "a", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "s", user: "u" } },
            ],
        })).toThrow(/duplicate/i);
    });
    it("throws on unknown edge.from", () => {
        expect(() => normalizeFlowSpec({
            version: "1",
            nodes: [{ id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
            edges: [{ from: "unknown", to: "a" }],
        })).toThrow(/unknown/i);
    });
});
//# sourceMappingURL=flowdsl.test.js.map