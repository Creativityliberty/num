import { describe, expect, it } from "vitest";
import { PlanPayloadSchema, ReviewOutputPayloadSchema, RunOutputPayloadSchema } from "../src/orchestrator/schemas.js";
describe("PlanPayloadSchema", () => {
    it("accepts valid plan", () => {
        const plan = {
            phases: [{ title: "Phase 1", steps: [{ action: "Do X" }] }],
        };
        const res = PlanPayloadSchema.safeParse(plan);
        expect(res.success).toBe(true);
    });
    it("rejects empty phases", () => {
        const plan = { phases: [] };
        const res = PlanPayloadSchema.safeParse(plan);
        expect(res.success).toBe(false);
    });
    it("defaults optional arrays", () => {
        const plan = { phases: [{ title: "P", steps: [] }] };
        const res = PlanPayloadSchema.parse(plan);
        expect(res.acceptanceCriteria).toEqual([]);
        expect(res.risks).toEqual([]);
    });
});
describe("RunOutputPayloadSchema", () => {
    it("accepts valid run output", () => {
        const out = { patch: "diff --git a/x b/x\n" };
        const res = RunOutputPayloadSchema.safeParse(out);
        expect(res.success).toBe(true);
    });
    it("rejects empty patch", () => {
        const out = { patch: "" };
        const res = RunOutputPayloadSchema.safeParse(out);
        expect(res.success).toBe(false);
    });
    it("defaults commands to empty array", () => {
        const out = { patch: "diff" };
        const res = RunOutputPayloadSchema.parse(out);
        expect(res.commands).toEqual([]);
    });
});
describe("ReviewOutputPayloadSchema", () => {
    it("accepts valid review", () => {
        const review = { severity: "low", approval: true };
        const res = ReviewOutputPayloadSchema.safeParse(review);
        expect(res.success).toBe(true);
    });
    it("rejects invalid severity", () => {
        const review = { severity: "critical", approval: true };
        const res = ReviewOutputPayloadSchema.safeParse(review);
        expect(res.success).toBe(false);
    });
    it("requires approval boolean", () => {
        const review = { severity: "low" };
        const res = ReviewOutputPayloadSchema.safeParse(review);
        expect(res.success).toBe(false);
    });
});
//# sourceMappingURL=schemas.test.js.map