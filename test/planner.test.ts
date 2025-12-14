import { describe, expect, it } from "vitest";
import { buildDeterministicPlan } from "../src/core/planner.js";

describe("planner v1 (deterministic)", () => {
  it("creates diagnose phase when errors present", () => {
    const plan = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 2,
      task: {
        goal: "Fix failing tests",
        context: { errors: "TypeError: cannot read properties of undefined", openFiles: ["src/a.ts"] },
      },
    });
    expect(plan.phases.some((p) => p.title.toLowerCase().includes("diagnose"))).toBe(true);
    expect(plan.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(plan.verification.length).toBeGreaterThan(0);
  });

  it("creates design phase when no error/bug keywords", () => {
    const plan = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 2,
      task: { goal: "Add a new endpoint for user export", context: { techStack: ["node", "typescript"] } },
    });
    expect(plan.phases.some((p) => p.title.toLowerCase().includes("design"))).toBe(true);
  });

  it("includes verify phase always", () => {
    const plan = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 1,
      task: { goal: "Update README docs", context: { openFiles: ["README.md"] } },
    });
    expect(plan.phases.some((p) => p.title.toLowerCase().includes("verify"))).toBe(true);
  });

  it("includes understand phase always", () => {
    const plan = buildDeterministicPlan({
      sessionId: "test-session",
      style: "checklist",
      depth: 1,
      task: { goal: "Refactor auth module" },
    });
    expect(plan.phases.some((p) => p.title.toLowerCase().includes("understand"))).toBe(true);
    expect(plan.sessionId).toBe("test-session");
    expect(plan.style).toBe("checklist");
  });

  it("adds more steps at higher depth", () => {
    const planDepth1 = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 1,
      task: { goal: "Fix bug in parser", context: { errors: "SyntaxError" } },
    });
    const planDepth2 = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 2,
      task: { goal: "Fix bug in parser", context: { errors: "SyntaxError" } },
    });

    const stepsDepth1 = planDepth1.phases.reduce((acc, p) => acc + p.steps.length, 0);
    const stepsDepth2 = planDepth2.phases.reduce((acc, p) => acc + p.steps.length, 0);

    expect(stepsDepth2).toBeGreaterThan(stepsDepth1);
  });

  it("includes selectedMode when provided", () => {
    const plan = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 2,
      task: { goal: "Add feature" },
      selectedModeMeta: { id: "test-mode", name: "Test Mode", confidence: 0.85 },
    });
    expect(plan.selectedMode).toEqual({ id: "test-mode", name: "Test Mode", confidence: 0.85 });
  });

  it("adds refactor risk when goal includes refactor", () => {
    const plan = buildDeterministicPlan({
      sessionId: "s",
      style: "plan",
      depth: 2,
      task: { goal: "Refactor the authentication module" },
    });
    expect(plan.risks.some((r) => r.toLowerCase().includes("refactor"))).toBe(true);
  });
});
