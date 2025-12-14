import type { z } from "zod";
import { requiresConfirmation, type Policy } from "../../core/policy.js";
import type { ModeRegistry } from "../../core/registry.js";
import { renderPromptPack } from "../../core/renderer.js";
import { suggestModes } from "../../core/router.js";
import { buildReviewPrompt, buildRunPrompt } from "../../core/runpack.js";
import {
    OrchestrateContinueInputSchema,
    OrchestrateRunInputSchema,
    PlanPayloadSchema,
    ReviewOutputPayloadSchema,
    RunOutputPayloadSchema,
    type TaskEnvelopeSchema,
} from "../../core/schemas.js";
import type { EventBus } from "../../obs/events.js";
import { ensureSessionId } from "../../obs/session.js";
import { writeBundle } from "../bundle.js";
import { gitCommit, gitCreateBranch } from "../git.js";
import { applyAndVerify } from "../pipeline.js";
import { loadRun, newRunId, saveRun } from "./store.js";

type NextStep =
  | {
      kind: "llm";
      stepId: "plan" | "run" | "review";
      tool: "modes.planPrompt" | "modes.runPrompt" | "modes.reviewPrompt";
      promptPack: unknown;
      expected: "PlanJSON" | "RunJSON" | "ReviewJSON";
    }
  | { kind: "manual"; message: string; suggestedTools?: string[] }
  | { kind: "done"; message: string };

type OrchestrateFlow = z.infer<typeof import("../../core/schemas.js").OrchestrateFlowSchema>;
type TaskEnvelope = z.infer<typeof TaskEnvelopeSchema>;

function now(): string {
  return new Date().toISOString();
}

function transition(run: Record<string, unknown>, to: string, note?: string) {
  const from = run.state as string;
  run.state = to;
  run.updatedAt = now();
  const history = run.history as Array<{ ts: string; from: string; to: string; note?: string }>;
  history.push({ ts: run.updatedAt as string, from, to, note });
}

function canAutoApply(policy: Policy, flow: OrchestrateFlow): boolean {
  if (!flow.autoApply) return false;
  return !!policy.allowWrite;
}

function canAutoVerify(policy: Policy, flow: OrchestrateFlow): boolean {
  if (!flow.autoApply) return false;
  return !!policy.allowExec;
}

function canCreateBranch(policy: Policy, flow: OrchestrateFlow): boolean {
  if (!flow.createBranch) return false;
  return !!policy.allowGit;
}

function canAutoCommit(policy: Policy, flow: OrchestrateFlow): boolean {
  if (!flow.autoCommit) return false;
  return !!policy.allowGit && !!policy.git?.allowCommit;
}

function planPromptPack(mode: { id: string; name: string; [k: string]: unknown }, sessionId: string, task: TaskEnvelope, style: "plan" | "checklist", depth: number) {
  const pack = renderPromptPack(mode as Parameters<typeof renderPromptPack>[0], {
    sessionId,
    id: mode.id,
    task,
    outputFormat: style === "checklist" ? "checklist" : "plan",
  } as Parameters<typeof renderPromptPack>[1]);

  const depthHint =
    depth === 1
      ? "Keep it short: 4–7 steps total."
      : depth === 2
      ? "Medium detail: phases + actionable steps (8–15 steps)."
      : "High detail: include edge cases, rollback, and validation (15–25 steps).";

  const planningDeveloperAddon = [
    "",
    "=== PLANNING MODE (IMPORTANT) ===",
    "You must NOT implement code. Only produce a plan.",
    `Requested style: ${style}`,
    `Depth: ${depth}. ${depthHint}`,
    "",
    "Return JSON with this shape:",
    "{",
    '  "phases": [{ "title": string, "steps": [{ "action": string, "details"?: string, "expectedOutput"?: string }] }],',
    '  "acceptanceCriteria": string[],',
    '  "verification": string[],',
    '  "risks": string[],',
    '  "assumptions": string[]',
    "}",
  ].join("\n");

  return { ...pack, developer: (pack.developer ?? "") + planningDeveloperAddon };
}

export async function orchestrateStart(deps: { policy: Policy; bus: EventBus; registry: ModeRegistry }, raw: unknown) {
  const input = OrchestrateRunInputSchema.parse(raw);
  const sessionId = ensureSessionId(input.sessionId);
  const runId = newRunId();
  const flow = input.flow;

  let selected = input.modeId ? deps.registry.get(input.modeId) : undefined;
  let confidence: number | undefined;
  if (!selected) {
    const best = suggestModes(deps.registry.allModes(), input.task, 1)[0];
    if (best) {
      selected = deps.registry.get(best.modeId) ?? undefined;
      confidence = best.confidence;
    }
  }
  if (!selected) {
    const modeData = {
      id: "unknown",
      name: "Unknown Mode",
      description: "",
      tags: [],
      categoryPath: [],
      prompts: [],
      source: "",
    };
    const mode = {
      id: modeData.id || "unknown",
      name: modeData.name || "Unknown Mode",
      description: modeData.description || "",
      tags: modeData.tags || [],
      categoryPath: modeData.categoryPath || [],
      prompts: modeData.prompts || {},
      source: modeData.source || {},
    } as any;
    const run = {
      runId,
      sessionId,
      createdAt: now(),
      updatedAt: now(),
      state: "FAILED",
      task: input.task,
      flow,
      history: [] as Array<{ ts: string; from: string; to: string; note?: string }>,
      fixIterations: 0,
      error: { code: "MODE_NOT_FOUND", message: input.modeId ?? "auto" },
    };
    await saveRun(deps.policy, run);
    return {
      sessionId,
      runId,
      state: "FAILED",
      error: run.error,
      nextStep: { kind: "done", message: "Failed: MODE_NOT_FOUND" } as NextStep,
    };
  }

  const run: Record<string, unknown> = {
    runId,
    sessionId,
    createdAt: now(),
    updatedAt: now(),
    state: "INIT",
    task: input.task,
    flow,
    selectedMode: { id: selected.id, name: selected.name, confidence },
    history: [] as Array<{ ts: string; from: string; to: string; note?: string }>,
    fixIterations: 0,
  };

  transition(run, "MODE_SELECTED", `Selected mode ${selected.id}`);

  if (flow.usePlanPrompt) {
    transition(run, "NEEDS_PLAN");
    await saveRun(deps.policy, run);
    return {
      sessionId,
      runId,
      state: run.state,
      selectedMode: run.selectedMode,
      nextStep: {
        kind: "llm",
        stepId: "plan",
        tool: "modes.planPrompt",
        promptPack: planPromptPack(selected as any, sessionId, input.task, "plan", 2),
        expected: "PlanJSON",
      } as NextStep,
    };
  }

  transition(run, "NEEDS_PATCH");
  await saveRun(deps.policy, run);
  return {
    sessionId,
    runId,
    state: run.state,
    selectedMode: run.selectedMode,
    nextStep: {
      kind: "llm",
      stepId: "run",
      tool: "modes.runPrompt",
      promptPack: buildRunPrompt(selected, input.task),
      expected: "RunJSON",
    } as NextStep,
  };
}

export async function orchestrateContinue(deps: { policy: Policy; bus: EventBus; registry: ModeRegistry }, raw: unknown) {
  const input = OrchestrateContinueInputSchema.parse(raw);
  const run = await loadRun(deps.policy, input.runId) as Record<string, unknown>;
  const sessionId = run.sessionId as string;

  if (run.state === "CANCELLED") {
    return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "done", message: "Run cancelled." } as NextStep };
  }
  if (run.state === "FAILED") {
    return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Run failed." } as NextStep };
  }

  const selectedMode = run.selectedMode as { id: string; name: string } | undefined;
  const mode = deps.registry.get(selectedMode?.id ?? "");
  if (!mode) {
    run.error = { code: "MODE_NOT_FOUND", message: selectedMode?.id ?? "unknown" };
    transition(run, "FAILED", "Mode not found during continue");
    await saveRun(deps.policy, run);
    return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Mode not found." } as NextStep };
  }

  const flow = run.flow as OrchestrateFlow;
  const task = run.task as TaskEnvelope;

  if (input.stepId === "plan") {
    if (run.state !== "NEEDS_PLAN") {
      return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected plan payload for current state." } as NextStep };
    }
    const plan = PlanPayloadSchema.parse(input.payload);
    run.plan = plan;
    transition(run, "NEEDS_PATCH", "Plan received");
    await saveRun(deps.policy, run);
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "llm",
        stepId: "run",
        tool: "modes.runPrompt",
        promptPack: buildRunPrompt(mode, task),
        expected: "RunJSON",
      } as NextStep,
    };
  }

  if (input.stepId === "run") {
    if (run.state !== "NEEDS_PATCH") {
      return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected run payload for current state." } as NextStep };
    }
    const out = RunOutputPayloadSchema.parse(input.payload);
    run.runOutput = out;
    if (flow.useReview) {
      transition(run, "NEEDS_REVIEW", "Run output received; awaiting review");
      await saveRun(deps.policy, run);
      return {
        sessionId,
        runId: run.runId,
        state: run.state,
        nextStep: {
          kind: "llm",
          stepId: "review",
          tool: "modes.reviewPrompt",
          promptPack: buildReviewPrompt(mode, out.patch),
          expected: "ReviewJSON",
        } as NextStep,
      };
    }
    transition(run, "READY_TO_APPLY", "Run output received; review skipped");
    await saveRun(deps.policy, run);
    return await orchestrateApplyCommitBundle(deps, run);
  }

  if (input.stepId === "review") {
    if (run.state !== "NEEDS_REVIEW") {
      return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected review payload for current state." } as NextStep };
    }
    const review = ReviewOutputPayloadSchema.parse(input.payload);
    run.reviewOutput = review;

    if (!review.approval || review.severity === "blocker") {
      const maxIters = flow.maxFixIterations ?? 2;
      const fixIterations = (run.fixIterations as number) ?? 0;
      if (fixIterations >= maxIters) {
        run.error = { code: "REVIEW_BLOCKED", message: "Exceeded max fix iterations." };
        transition(run, "FAILED", "Review blocked too many times");
        await saveRun(deps.policy, run);
        return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Failed: review blocked." } as NextStep };
      }
      run.fixIterations = fixIterations + 1;
      transition(run, "NEEDS_PATCH", `Review blocked; requesting fix iteration ${run.fixIterations}`);
      await saveRun(deps.policy, run);

      const existingContext = task.context ?? {};
      const fixTask = {
        ...task,
        context: {
          ...existingContext,
          errors: `${(existingContext as Record<string, unknown>).errors ?? ""}\nReview findings to fix: ${JSON.stringify(review.findings)}`.trim(),
        },
      };

      return {
        sessionId,
        runId: run.runId,
        state: run.state,
        nextStep: {
          kind: "llm",
          stepId: "run",
          tool: "modes.runPrompt",
          promptPack: buildRunPrompt(mode, fixTask as Parameters<typeof buildRunPrompt>[1]),
          expected: "RunJSON",
        } as NextStep,
      };
    }

    transition(run, "READY_TO_APPLY", "Review approved");
    await saveRun(deps.policy, run);
    return await orchestrateApplyCommitBundle(deps, run);
  }

  return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unknown stepId." } as NextStep };
}

async function orchestrateApplyCommitBundle(deps: { policy: Policy; bus: EventBus; registry: ModeRegistry }, run: Record<string, unknown>) {
  const sessionId = run.sessionId as string;
  const out = run.runOutput as { patch?: string; commands?: string[]; pr?: { title?: string } } | undefined;
  const flow = run.flow as OrchestrateFlow;
  const selectedMode = run.selectedMode as { id?: string } | undefined;

  if (!out?.patch) {
    return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "No patch available to apply." } as NextStep };
  }

  // v11.2: Confirmation gates (hard gate before auto-apply/exec/branch/commit)
  if (flow.autoApply && requiresConfirmation(deps.policy, "applyPatch")) {
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "manual",
        message: "Confirmation required: applyPatch (policy.requireConfirmationFor includes applyPatch).",
        suggestedTools: ["workspace.applyPatch", "pipeline.applyAndVerify"],
      } as NextStep,
    };
  }

  if (flow.autoApply && (out.commands?.length ?? 0) > 0 && requiresConfirmation(deps.policy, "exec")) {
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "manual",
        message: "Confirmation required: exec (policy.requireConfirmationFor includes exec).",
        suggestedTools: ["exec.run", "pipeline.applyAndVerify"],
      } as NextStep,
    };
  }

  if (flow.createBranch && requiresConfirmation(deps.policy, "branch")) {
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "manual",
        message: "Confirmation required: branch (policy.requireConfirmationFor includes branch).",
        suggestedTools: ["git.branch.create"],
      } as NextStep,
    };
  }

  if (flow.autoCommit && requiresConfirmation(deps.policy, "commit")) {
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "manual",
        message: "Confirmation required: commit (policy.requireConfirmationFor includes commit).",
        suggestedTools: ["git.commit"],
      } as NextStep,
    };
  }

  if (!canAutoApply(deps.policy, flow) || !canAutoVerify(deps.policy, flow)) {
    const reason = !deps.policy.allowWrite
      ? "policy.allowWrite is false"
      : !deps.policy.allowExec
      ? "policy.allowExec is false"
      : "flow.autoApply is false";
    return {
      sessionId,
      runId: run.runId,
      state: run.state,
      nextStep: {
        kind: "manual",
        message: `Ready to apply, but auto-apply is disabled (${reason}). Use pipeline.applyAndVerify manually.`,
        suggestedTools: ["pipeline.applyAndVerify", "workspace.applyPatch", "exec.run"],
      } as NextStep,
    };
  }

  const pipe = await applyAndVerify({
    policy: deps.policy,
    diff: out.patch,
    commands: out.commands ?? [],
    dryRun: !!flow.dryRun,
    timeoutMs: 60000,
    runId: run.runId as string,
  });
  run.pipeline = pipe;
  transition(run, "APPLIED_AND_VERIFIED", "Pipeline completed");

  if (canCreateBranch(deps.policy, flow)) {
    const desired = flow.branchName ?? `mcp/${selectedMode?.id ?? "run"}/${(run.runId as string).slice(0, 8)}`;
    try {
      await gitCreateBranch(deps.policy, desired);
      run.git = { ...(run.git as object ?? {}), branch: desired };
      transition(run, "BRANCHED", `Created branch ${desired}`);
    } catch {
      // Branch creation failed, continue without branching
    }
  }

  if (canAutoCommit(deps.policy, flow)) {
    const msg = flow.commitMessage ?? (out.pr?.title ? String(out.pr.title).slice(0, 120) : `mcp: ${selectedMode?.id ?? "change"}`);
    try {
      const sha = await gitCommit(deps.policy, msg, true, !!flow.dryRun);
      run.git = { ...(run.git as object ?? {}), commitSha: sha };
      transition(run, "COMMITTED", `Committed ${sha}`);
    } catch {
      // Commit failed, continue without committing
    }
  }

  const bundle = {
    meta: {
      sessionId: run.sessionId as string,
      createdAt: now(),
      workspaceRoot: deps.policy.workspaceRoot,
      modeId: selectedMode?.id ?? null,
    },
    task: run.task,
    plan: run.plan ?? null,
    runOutput: run.runOutput ?? null,
    reviewOutput: run.reviewOutput ?? null,
    execResults: run.pipeline ?? null,
    git: run.git ?? null,
  };

  const written = await writeBundle(deps.policy, run.sessionId as string, bundle);
  run.bundlePath = written;
  transition(run, "BUNDLED", `Bundle written ${written}`);

  transition(run, "DONE", "Orchestration finished");
  await saveRun(deps.policy, run);

  return {
    sessionId,
    runId: run.runId,
    state: run.state,
    bundlePath: run.bundlePath,
    git: run.git ?? null,
    nextStep: { kind: "done", message: "Done. Bundle created." } as NextStep,
  };
}

export async function orchestrateStatus(deps: { policy: Policy }, runId: string) {
  const run = await loadRun(deps.policy, runId);
  return {
    runId: run.runId,
    sessionId: run.sessionId,
    state: run.state,
    selectedMode: run.selectedMode ?? null,
    bundlePath: run.bundlePath ?? null,
    git: run.git ?? null,
    fixIterations: run.fixIterations ?? 0,
    updatedAt: run.updatedAt,
  };
}

export async function orchestrateCancel(deps: { policy: Policy }, runId: string) {
  const run = await loadRun(deps.policy, runId) as Record<string, unknown>;
  if (run.state === "DONE" || run.state === "FAILED") return run;
  transition(run, "CANCELLED", "Cancelled by user");
  await saveRun(deps.policy, run);
  return run;
}
