import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { AgentsEngine } from "../src/server/agents/engine.js";
describe("agents serial (12.1)", () => {
    it("creates a run and returns planner job", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({
            task: { goal: "Do X", context: { foo: "bar" } },
            flow: { autoApply: false, useReview: true, useSecurity: true },
        });
        const next = await engine.next({ runId });
        expect(next.job?.role).toBe("planner");
        expect(next.expectedSchema).toBe("multiPlan");
        expect(next.promptPack?.user).toContain("Task goal");
    });
    it("accepts planner payload and advances to implementer (12.3: implementA or implementB)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "Change file", context: {} } });
        // Submit planner output
        const planPayload = {
            jobs: [
                { jobId: "plan", role: "planner", goal: "x", dependsOn: [], status: "done" },
            ],
            acceptanceCriteria: ["Tests pass"],
        };
        const res = await engine.submit({ runId, jobId: "plan", role: "planner", payload: planPayload });
        expect(res.ok).toBe(true);
        // Next should be implementer (12.3: implementA or implementB)
        const next = await engine.next({ runId });
        expect(next.job?.role).toBe("implementer");
        expect(["implementA", "implementB"]).toContain(next.job?.jobId);
        expect(next.expectedSchema).toBe("patchCandidate");
    });
    it("accepts implementer payload and stores candidates (12.3)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "Change file", context: {} } });
        // Mark planner done
        await engine.submit({
            runId,
            jobId: "plan",
            role: "planner",
            payload: { jobs: [{ jobId: "plan", role: "planner", goal: "x" }] },
        });
        // Implementer A
        const candA = {
            candidateId: "A",
            patch: "diff --git a/a b/a\n--- a/a\n+++ b/a\n",
            commands: [{ cmd: "node", args: ["-v"] }],
        };
        const resA = await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: candA });
        expect(resA.ok).toBe(true);
        // Implementer B
        const candB = {
            candidateId: "B",
            patch: "diff --git a/b b/b\n",
            commands: [],
        };
        const resB = await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: candB });
        expect(resB.ok).toBe(true);
        // Next should be merge (arbiter)
        const next = await engine.next({ runId });
        expect(next.job?.role).toBe("arbiter");
        expect(next.job?.jobId).toBe("merge");
    });
    it("transitions to READY_TO_APPLY after all approvals (12.3)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "Change file", context: {} } });
        // Planner
        await engine.submit({
            runId,
            jobId: "plan",
            role: "planner",
            payload: { jobs: [{ jobId: "plan", role: "planner", goal: "x" }] },
        });
        // Implementer A + B
        await engine.submit({
            runId,
            jobId: "implementA",
            role: "implementer",
            payload: { candidateId: "A", patch: "diff --git a/a b/a\n--- a/a\n+++ b/a\n", commands: [] },
        });
        await engine.submit({
            runId,
            jobId: "implementB",
            role: "implementer",
            payload: { candidateId: "B", patch: "diff --git a/b b/b\n", commands: [] },
        });
        // Get merge job to mark it running
        await engine.next({ runId });
        // Merge decision
        await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });
        // Reviewer approves
        await engine.submit({
            runId,
            jobId: "review",
            role: "reviewer",
            payload: { verdict: "approve", findings: [] },
        });
        // Security allows
        await engine.submit({
            runId,
            jobId: "security",
            role: "security",
            payload: { verdict: "allow", issues: [] },
        });
        // Next should be manual (READY_TO_APPLY)
        const next = await engine.next({ runId });
        expect(next.status).toBe("manual");
        expect(next.message).toContain("Ready to apply");
        expect(next.suggestedTools).toContain("pipeline.applyAndVerify");
    });
    it("fails run when reviewer rejects (12.3)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "Change file", context: {} } });
        await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
        await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff", commands: [] } });
        await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
        await engine.next({ runId }); // get merge job
        await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });
        // Reviewer rejects
        const res = await engine.submit({
            runId,
            jobId: "review",
            role: "reviewer",
            payload: { verdict: "reject", findings: [{ type: "bug", message: "Critical bug", severity: "high" }] },
        });
        expect(res.status).toBe("failed");
        expect(res.message).toContain("rejected");
    });
    it("blocks run when security blocks (12.3)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "Change file", context: {} } });
        await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
        await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff", commands: [] } });
        await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
        await engine.next({ runId }); // get merge job
        await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });
        await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve" } });
        // Security blocks
        const res = await engine.submit({
            runId,
            jobId: "security",
            role: "security",
            payload: { verdict: "block", issues: [{ type: "secret", message: "API key exposed", severity: "critical" }] },
        });
        expect(res.status).toBe("failed");
        expect(res.message).toContain("blocked");
    });
    it("READY_TO_APPLY returns applyPayload with sessionId (12.3)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-"));
        const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
        const engine = new AgentsEngine({ policy });
        const { runId } = await engine.plan({ task: { goal: "X", context: {} } });
        await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
        await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff --git a/a b/a\n--- a/a\n+++ b/a\n", commands: [{ cmd: "npm", args: ["test"] }] } });
        await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
        await engine.next({ runId }); // get merge job
        await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });
        await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve", findings: [] } });
        await engine.submit({ runId, jobId: "security", role: "security", payload: { verdict: "allow", issues: [] } });
        const next = await engine.next({ runId });
        expect(next.status).toBe("manual");
        expect(next.sessionId).toBeTruthy();
        expect(next.applyPayload?.patch).toContain("diff --git");
        expect(next.applyPayload?.commands).toHaveLength(1);
    });
});
//# sourceMappingURL=agents-serial.test.js.map