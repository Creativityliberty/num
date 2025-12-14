import { describe, expect, it } from "vitest";
import { runOrchestration } from "../src/orchestrator/runner.js";
class FakeAdapter {
    id = "fake";
    outputs;
    constructor(outputs) {
        this.outputs = outputs.map((o) => JSON.stringify(o));
    }
    async completeJSON() {
        const out = this.outputs.shift();
        if (!out)
            throw new Error("No more outputs");
        return out;
    }
}
class FakeMcp {
    calls = [];
    async callToolJSON(tool, input) {
        this.calls.push({ tool, input });
        if (tool === "orchestrate.run") {
            return {
                sessionId: "s",
                runId: "r",
                state: "NEEDS_PLAN",
                nextStep: {
                    kind: "llm",
                    stepId: "plan",
                    tool: "modes.planPrompt",
                    promptPack: { system: "", developer: "", task: input.task },
                    expected: "PlanJSON",
                },
            };
        }
        if (tool === "orchestrate.continue") {
            const inp = input;
            if (inp.stepId === "plan") {
                return {
                    sessionId: "s",
                    runId: "r",
                    state: "NEEDS_PATCH",
                    nextStep: {
                        kind: "llm",
                        stepId: "run",
                        tool: "modes.runPrompt",
                        promptPack: { system: "", developer: "", task: { goal: "x", context: {} } },
                        expected: "RunJSON",
                    },
                };
            }
            if (inp.stepId === "run") {
                return {
                    sessionId: "s",
                    runId: "r",
                    state: "NEEDS_REVIEW",
                    nextStep: {
                        kind: "llm",
                        stepId: "review",
                        tool: "modes.reviewPrompt",
                        promptPack: { system: "", developer: "", task: { goal: "x", context: {} } },
                        expected: "ReviewJSON",
                    },
                };
            }
            if (inp.stepId === "review") {
                return {
                    sessionId: "s",
                    runId: "r",
                    state: "DONE",
                    nextStep: { kind: "done", message: "ok" },
                    bundlePath: "x",
                };
            }
        }
        throw new Error("unexpected");
    }
}
describe("runOrchestration", () => {
    it("completes handshake with plan -> run -> review", async () => {
        const mcp = new FakeMcp();
        const adapter = new FakeAdapter([
            { phases: [{ title: "P", steps: [{ action: "a" }] }] },
            { patch: "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@\n", commands: [] },
            { severity: "low", findings: [], approval: true },
        ]);
        const res = await runOrchestration({
            mcp: mcp,
            adapter,
            task: { goal: "x", context: {} },
            flow: { usePlanPrompt: true },
        });
        expect(res.status).toBe("done");
        expect(res.bundlePath).toBe("x");
    });
    it("returns manual when policy blocks", async () => {
        const mcp = {
            async callToolJSON(tool) {
                return {
                    sessionId: "s",
                    runId: "r",
                    state: "READY_TO_APPLY",
                    nextStep: {
                        kind: "manual",
                        message: "policy.allowWrite=false",
                        suggestedTools: ["pipeline.applyAndVerify"],
                    },
                };
            },
        };
        const adapter = new FakeAdapter([]);
        const res = await runOrchestration({
            mcp: mcp,
            adapter,
            task: { goal: "x", context: {} },
        });
        expect(res.status).toBe("manual");
        expect(res.message).toContain("allowWrite");
    });
});
//# sourceMappingURL=runner.test.js.map