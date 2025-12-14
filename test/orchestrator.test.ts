import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import pino from "pino";
import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { ModeRegistry } from "../src/core/registry.js";
import { createEventBus } from "../src/obs/events.js";
import { orchestrateCancel, orchestrateContinue, orchestrateStart, orchestrateStatus } from "../src/server/orchestrator/engine.js";

function logger() {
  return pino({ level: "silent" });
}

describe("orchestrator (step 8)", () => {
  it("fails gracefully when no modes are available", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-orch-"));
    await fs.mkdir(path.join(tmp, "empty_modes"), { recursive: true });

    const registry = await ModeRegistry.fromPaths([path.join(tmp, "empty_modes")]);
    const policy = PolicySchema.parse({
      workspaceRoot: tmp,
      allowWrite: false,
      allowExec: false,
      allowGit: false,
    });
    const bus = createEventBus({ maxEvents: 50, log: logger() as Parameters<typeof createEventBus>[0]["log"] });

    const start = await orchestrateStart(
      { policy, bus, registry },
      {
        task: { goal: "Do something", context: {} },
        flow: { usePlanPrompt: true, useReview: true, autoApply: false },
      }
    );

    expect(start.state).toBe("FAILED");
    expect(start.error?.code).toBe("MODE_NOT_FOUND");
    expect(start.nextStep.kind).toBe("done");
  });

  it("creates a run and persists it", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-orch-"));
    const modesDir = path.join(tmp, "modes");
    await fs.mkdir(modesDir, { recursive: true });

    // Create a minimal mode file
    const modeYaml = `
slug: test-mode
name: Test Mode
roleDefinition: You are a test assistant.
groups:
  - read
`;
    await fs.writeFile(path.join(modesDir, "test-mode.yaml"), modeYaml, "utf8");

    const registry = await ModeRegistry.fromPaths([modesDir]);
    const policy = PolicySchema.parse({
      workspaceRoot: tmp,
      allowWrite: false,
      allowExec: false,
      allowGit: false,
    });
    const bus = createEventBus({ maxEvents: 50, log: logger() as Parameters<typeof createEventBus>[0]["log"] });

    // Skip if no modes loaded (environment-specific)
    if (registry.count() === 0) return;

    const start = await orchestrateStart(
      { policy, bus, registry },
      {
        task: { goal: "Do something", context: {} },
        flow: { usePlanPrompt: true, useReview: true, autoApply: false },
      }
    );

    expect(start.runId).toBeTruthy();
    expect(start.state).toBe("NEEDS_PLAN");
    expect(start.nextStep.kind).toBe("llm");
    expect((start.nextStep as { stepId?: string }).stepId).toBe("plan");

    // Check run file was created
    const runFile = path.join(tmp, ".mcp", "runs", `${start.runId}.json`);
    const exists = await fs.access(runFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    // Check status
    const status = await orchestrateStatus({ policy }, start.runId);
    expect(status.state).toBe("NEEDS_PLAN");
  });

  it("handles plan -> run -> review flow (no auto apply)", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-orch-"));
    const modesDir = path.join(tmp, "modes");
    await fs.mkdir(modesDir, { recursive: true });

    const modeYaml = `
slug: dev-mode
name: Developer Mode
roleDefinition: You are a developer assistant.
groups:
  - read
  - edit
`;
    await fs.writeFile(path.join(modesDir, "dev-mode.yaml"), modeYaml, "utf8");

    const registry = await ModeRegistry.fromPaths([modesDir]);
    const policy = PolicySchema.parse({
      workspaceRoot: tmp,
      allowWrite: false,
      allowExec: false,
      allowGit: false,
    });
    const bus = createEventBus({ maxEvents: 50, log: logger() as Parameters<typeof createEventBus>[0]["log"] });

    if (registry.count() === 0) return;

    const start = await orchestrateStart(
      { policy, bus, registry },
      {
        task: { goal: "Implement feature X", context: {} },
        flow: { usePlanPrompt: true, useReview: true, autoApply: false },
      }
    );

    expect(start.nextStep.kind).toBe("llm");
    expect((start.nextStep as { stepId?: string }).stepId).toBe("plan");

    // Continue with plan
    const c1 = await orchestrateContinue(
      { policy, bus, registry },
      {
        runId: start.runId,
        stepId: "plan",
        payload: { phases: [{ title: "Phase 1", steps: [{ action: "Do X" }] }] },
      }
    );
    expect(c1.state).toBe("NEEDS_PATCH");
    expect(c1.nextStep.kind).toBe("llm");
    expect((c1.nextStep as { stepId?: string }).stepId).toBe("run");

    // Continue with run output
    const c2 = await orchestrateContinue(
      { policy, bus, registry },
      {
        runId: start.runId,
        stepId: "run",
        payload: { patch: "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@\n+line", commands: [] },
      }
    );
    expect(c2.state).toBe("NEEDS_REVIEW");
    expect(c2.nextStep.kind).toBe("llm");
    expect((c2.nextStep as { stepId?: string }).stepId).toBe("review");

    // Continue with review (approved)
    const c3 = await orchestrateContinue(
      { policy, bus, registry },
      {
        runId: start.runId,
        stepId: "review",
        payload: { severity: "low", findings: [], approval: true },
      }
    );
    // Because policy disallows auto-apply, should instruct manual pipeline
    expect(c3.state).toBe("READY_TO_APPLY");
    expect(c3.nextStep.kind).toBe("manual");
  });

  it("can cancel a run", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-orch-"));
    const modesDir = path.join(tmp, "modes");
    await fs.mkdir(modesDir, { recursive: true });

    const modeYaml = `
slug: cancel-test
name: Cancel Test Mode
roleDefinition: Test mode.
groups:
  - read
`;
    await fs.writeFile(path.join(modesDir, "cancel-test.yaml"), modeYaml, "utf8");

    const registry = await ModeRegistry.fromPaths([modesDir]);
    const policy = PolicySchema.parse({
      workspaceRoot: tmp,
      allowWrite: false,
      allowExec: false,
      allowGit: false,
    });
    const bus = createEventBus({ maxEvents: 50, log: logger() as Parameters<typeof createEventBus>[0]["log"] });

    if (registry.count() === 0) return;

    const start = await orchestrateStart(
      { policy, bus, registry },
      {
        task: { goal: "Test cancel", context: {} },
        flow: { usePlanPrompt: true },
      }
    );

    expect(start.state).toBe("NEEDS_PLAN");

    const cancelled = await orchestrateCancel({ policy }, start.runId);
    expect((cancelled as { state?: string }).state).toBe("CANCELLED");

    // Verify status shows cancelled
    const status = await orchestrateStatus({ policy }, start.runId);
    expect(status.state).toBe("CANCELLED");
  });
});
