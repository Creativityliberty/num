import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { AgentsEngine } from "../src/server/agents/engine.js";

describe("agents consensus implement (12.3)", () => {
  it("creates two implementer jobs and merge job", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-12-3-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp, allowWrite: false, allowExec: false, allowGit: false });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "Do consensus change", context: {} } });

    // First next() returns planner job and marks it running
    const plannerJob = await engine.next({ runId });
    expect(plannerJob.job?.role).toBe("planner");
    expect(plannerJob.job?.jobId).toBe("plan");

    // Submit planner (marks it done) - jobs array must have at least 1 element
    const submitRes = await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [{ jobId: "plan", role: "planner", goal: "x" }] } });
    expect(submitRes.ok).toBe(true);

    // After planner is done, implementA and implementB should be runnable
    const n1 = await engine.next({ runId });
    expect(n1.job).not.toBeNull();
    expect(n1.job?.role).toBe("implementer");
    expect(["implementA", "implementB"]).toContain(n1.job?.jobId);
    expect(n1.expectedSchema).toBe("patchCandidate");
  });

  it("stores multiple candidates from implementers", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-12-3-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });

    // implement A
    await engine.submit({
      runId,
      jobId: "implementA",
      role: "implementer",
      payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] },
    });

    // implement B
    await engine.submit({
      runId,
      jobId: "implementB",
      role: "implementer",
      payload: { candidateId: "B", patch: "diff --git a/b b/b\n", commands: [] },
    });

    // next should be merge (arbiter)
    const n = await engine.next({ runId });
    expect(n.job?.jobId).toBe("merge");
    expect(n.job?.role).toBe("arbiter");
    expect(n.expectedSchema).toBe("mergeDecision");
  });

  it("mergeDecision materializes chosen candidate", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-12-3-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({
      runId,
      jobId: "implementA",
      role: "implementer",
      payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] },
    });
    await engine.submit({
      runId,
      jobId: "implementB",
      role: "implementer",
      payload: { candidateId: "B", patch: "diff --git a/b b/b\n", commands: [{ cmd: "npm", args: ["test"] }] },
    });

    // Get merge job to mark it running
    await engine.next({ runId });

    // choose B
    const md = await engine.mergeDecision({ runId, decision: { chosenCandidateId: "B", rationale: "better" } });
    expect(md.ok).toBe(true);

    // After merge, next runnable should be review or security (parallel)
    const n2 = await engine.next({ runId });
    expect(["reviewer", "security"]).toContain(n2.job?.role);
  });

  it("fails mergeDecision if candidate id not found", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-12-3-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });
    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({
      runId,
      jobId: "implementA",
      role: "implementer",
      payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] },
    });
    await engine.submit({
      runId,
      jobId: "implementB",
      role: "implementer",
      payload: { candidateId: "B", patch: "diff --git a/b b/b\n", commands: [] },
    });

    const res = await engine.mergeDecision({ runId, decision: { chosenCandidateId: "C" } });
    expect(res.ok).toBe(false);
    expect(res.message).toContain("not found");
  });

  it("reaches READY_TO_APPLY after merge + reviews", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-agents-12-3-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({
      runId,
      jobId: "implementA",
      role: "implementer",
      payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] },
    });
    await engine.submit({
      runId,
      jobId: "implementB",
      role: "implementer",
      payload: { candidateId: "B", patch: "diff --git a/b b/b\n", commands: [] },
    });

    // Get merge job
    await engine.next({ runId });
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // Submit both reviews
    await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve" } });
    await engine.submit({ runId, jobId: "security", role: "security", payload: { verdict: "allow" } });

    const next = await engine.next({ runId });
    expect(next.status).toBe("manual");
    expect(next.message).toContain("Ready to apply");
    expect(next.applyPayload?.patch).toContain("diff --git a/a");
  });
});
