import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { AgentsEngine } from "../src/server/agents/engine.js";

describe("agents parallel review (12.2/12.3)", () => {
  it("allows reviewer and security in parallel after merge (12.3)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-12-2-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] } });
    await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });

    // Get merge job
    await engine.next({ runId });
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // After merge, both reviewer and security should be runnable
    const n1 = await engine.next({ runId });
    expect(n1.job).not.toBeNull();
    const role1 = n1.job?.role;

    // Submit first job
    if (role1 === "reviewer") {
      await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve" } });
    } else {
      await engine.submit({ runId, jobId: "security", role: "security", payload: { verdict: "allow" } });
    }

    // Get second job
    const n2 = await engine.next({ runId });
    expect(n2.job).not.toBeNull();
    const role2 = n2.job?.role;

    // Both roles should be present
    const roles = [role1, role2].sort();
    expect(roles).toEqual(["reviewer", "security"]);
  });

  it("blocks immediately if reviewer rejects (12.3)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-12-2-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff", commands: [] } });
    await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
    await engine.next({ runId }); // get merge job
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // Submit reviewer rejection
    const res = await engine.submit({
      runId,
      jobId: "review",
      role: "reviewer",
      payload: { verdict: "reject", findings: [{ type: "bug", message: "Critical", severity: "high" }] },
    });

    expect(res.status).toBe("failed");
    expect(res.message).toContain("rejected");
  });

  it("blocks immediately if security blocks (12.3)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-12-2-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff", commands: [] } });
    await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
    await engine.next({ runId }); // get merge job
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // Submit security block
    const res = await engine.submit({
      runId,
      jobId: "security",
      role: "security",
      payload: { verdict: "block", issues: [{ type: "secret", message: "Exposed", severity: "critical" }] },
    });

    expect(res.status).toBe("failed");
    expect(res.message).toContain("blocked");
  });

  it("reaches READY_TO_APPLY only when both approve (12.3)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-12-2-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff --git a/a b/a\n", commands: [] } });
    await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
    await engine.next({ runId }); // get merge job
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // Submit both approvals (order doesn't matter)
    await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve" } });
    await engine.submit({ runId, jobId: "security", role: "security", payload: { verdict: "allow" } });

    const next = await engine.next({ runId });
    expect(next.status).toBe("manual");
    expect(next.message).toContain("Ready to apply");
    expect(next.applyPayload?.patch).toContain("diff --git");
  });

  it("stays pending if only one approves (12.3)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-12-2-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    const { runId } = await engine.plan({ task: { goal: "X" } });

    await engine.submit({ runId, jobId: "plan", role: "planner", payload: { jobs: [] } });
    await engine.submit({ runId, jobId: "implementA", role: "implementer", payload: { candidateId: "A", patch: "diff", commands: [] } });
    await engine.submit({ runId, jobId: "implementB", role: "implementer", payload: { candidateId: "B", patch: "diff2", commands: [] } });
    await engine.next({ runId }); // get merge job
    await engine.mergeDecision({ runId, decision: { chosenCandidateId: "A" } });

    // Only reviewer approves
    await engine.submit({ runId, jobId: "review", role: "reviewer", payload: { verdict: "approve" } });

    // Security is still pending, so next should return security job
    const next = await engine.next({ runId });
    expect(next.job?.role).toBe("security");
    expect(next.status).toBe("running");
  });
});
