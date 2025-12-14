import { requiresConfirmation } from "../../core/policy.js";
import { renderPromptPack } from "../../core/renderer.js";
import { suggestModes } from "../../core/router.js";
import { buildReviewPrompt, buildRunPrompt } from "../../core/runpack.js";
import { OrchestrateContinueInputSchema, OrchestrateRunInputSchema, PlanPayloadSchema, ReviewOutputPayloadSchema, RunOutputPayloadSchema, } from "../../core/schemas.js";
import { ensureSessionId } from "../../obs/session.js";
import { writeBundle } from "../bundle.js";
import { gitCommit, gitCreateBranch } from "../git.js";
import { applyAndVerify } from "../pipeline.js";
import { loadRun, newRunId, saveRun } from "./store.js";
function now() {
    return new Date().toISOString();
}
function transition(run, to, note) {
    const from = run.state;
    run.state = to;
    run.updatedAt = now();
    const history = run.history;
    history.push({ ts: run.updatedAt, from, to, note });
}
function canAutoApply(policy, flow) {
    if (!flow.autoApply)
        return false;
    return !!policy.allowWrite;
}
function canAutoVerify(policy, flow) {
    if (!flow.autoApply)
        return false;
    return !!policy.allowExec;
}
function canCreateBranch(policy, flow) {
    if (!flow.createBranch)
        return false;
    return !!policy.allowGit;
}
function canAutoCommit(policy, flow) {
    if (!flow.autoCommit)
        return false;
    return !!policy.allowGit && !!policy.git?.allowCommit;
}
function planPromptPack(mode, sessionId, task, style, depth) {
    const pack = renderPromptPack(mode, {
        sessionId,
        id: mode.id,
        task,
        outputFormat: style === "checklist" ? "checklist" : "plan",
    });
    const depthHint = depth === 1
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
export async function orchestrateStart(deps, raw) {
    const input = OrchestrateRunInputSchema.parse(raw);
    const sessionId = ensureSessionId(input.sessionId);
    const runId = newRunId();
    const flow = input.flow;
    let selected = input.modeId ? deps.registry.get(input.modeId) : undefined;
    let confidence;
    if (!selected) {
        const best = suggestModes(deps.registry.allModes(), input.task, 1)[0];
        if (best) {
            selected = deps.registry.get(best.modeId) ?? undefined;
            confidence = best.confidence;
        }
    }
    if (!selected) {
        const modeData = {
            id: 'unknown',
            name: 'Unknown Mode',
            description: '',
            tags: [],
            categoryPath: [],
            prompts: [],
            source: '',
        };
        const mode = {
            id: modeData.id,
            name: modeData.name,
            description: modeData.description,
            tags: modeData.tags,
            categoryPath: modeData.categoryPath,
            prompts: modeData.prompts,
            source: modeData.source,
        };
        const run = {
            runId,
            sessionId,
            createdAt: now(),
            updatedAt: now(),
            state: "FAILED",
            task: input.task,
            flow,
            history: [],
            fixIterations: 0,
            error: { code: "MODE_NOT_FOUND", message: input.modeId ?? "auto" },
        };
        await saveRun(deps.policy, run);
        return {
            sessionId,
            runId,
            state: "FAILED",
            error: run.error,
            nextStep: { kind: "done", message: "Failed: MODE_NOT_FOUND" },
        };
    }
    const run = {
        runId,
        sessionId,
        createdAt: now(),
        updatedAt: now(),
        state: "INIT",
        task: input.task,
        flow,
        selectedMode: { id: selected.id, name: selected.name, confidence },
        history: [],
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
                promptPack: planPromptPack(selected, sessionId, input.task, "plan", 2),
                expected: "PlanJSON",
            },
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
        },
    };
}
export async function orchestrateContinue(deps, raw) {
    const input = OrchestrateContinueInputSchema.parse(raw);
    const run = await loadRun(deps.policy, input.runId);
    const sessionId = run.sessionId;
    if (run.state === "CANCELLED") {
        return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "done", message: "Run cancelled." } };
    }
    if (run.state === "FAILED") {
        return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Run failed." } };
    }
    const selectedMode = run.selectedMode;
    const mode = deps.registry.get(selectedMode?.id ?? "");
    if (!mode) {
        run.error = { code: "MODE_NOT_FOUND", message: selectedMode?.id ?? "unknown" };
        transition(run, "FAILED", "Mode not found during continue");
        await saveRun(deps.policy, run);
        return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Mode not found." } };
    }
    const flow = run.flow;
    const task = run.task;
    if (input.stepId === "plan") {
        if (run.state !== "NEEDS_PLAN") {
            return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected plan payload for current state." } };
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
            },
        };
    }
    if (input.stepId === "run") {
        if (run.state !== "NEEDS_PATCH") {
            return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected run payload for current state." } };
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
                },
            };
        }
        transition(run, "READY_TO_APPLY", "Run output received; review skipped");
        await saveRun(deps.policy, run);
        return await orchestrateApplyCommitBundle(deps, run);
    }
    if (input.stepId === "review") {
        if (run.state !== "NEEDS_REVIEW") {
            return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unexpected review payload for current state." } };
        }
        const review = ReviewOutputPayloadSchema.parse(input.payload);
        run.reviewOutput = review;
        if (!review.approval || review.severity === "blocker") {
            const maxIters = flow.maxFixIterations ?? 2;
            const fixIterations = run.fixIterations ?? 0;
            if (fixIterations >= maxIters) {
                run.error = { code: "REVIEW_BLOCKED", message: "Exceeded max fix iterations." };
                transition(run, "FAILED", "Review blocked too many times");
                await saveRun(deps.policy, run);
                return { sessionId, runId: run.runId, state: run.state, error: run.error, nextStep: { kind: "done", message: "Failed: review blocked." } };
            }
            run.fixIterations = fixIterations + 1;
            transition(run, "NEEDS_PATCH", `Review blocked; requesting fix iteration ${run.fixIterations}`);
            await saveRun(deps.policy, run);
            const existingContext = task.context ?? {};
            const fixTask = {
                ...task,
                context: {
                    ...existingContext,
                    errors: `${existingContext.errors ?? ""}\nReview findings to fix: ${JSON.stringify(review.findings)}`.trim(),
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
                    promptPack: buildRunPrompt(mode, fixTask),
                    expected: "RunJSON",
                },
            };
        }
        transition(run, "READY_TO_APPLY", "Review approved");
        await saveRun(deps.policy, run);
        return await orchestrateApplyCommitBundle(deps, run);
    }
    return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "Unknown stepId." } };
}
async function orchestrateApplyCommitBundle(deps, run) {
    const sessionId = run.sessionId;
    const out = run.runOutput;
    const flow = run.flow;
    const selectedMode = run.selectedMode;
    if (!out?.patch) {
        return { sessionId, runId: run.runId, state: run.state, nextStep: { kind: "manual", message: "No patch available to apply." } };
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
            },
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
            },
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
            },
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
            },
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
            },
        };
    }
    const pipe = await applyAndVerify({
        policy: deps.policy,
        diff: out.patch,
        commands: out.commands ?? [],
        dryRun: !!flow.dryRun,
        timeoutMs: 60000,
        runId: run.runId,
    });
    run.pipeline = pipe;
    transition(run, "APPLIED_AND_VERIFIED", "Pipeline completed");
    if (canCreateBranch(deps.policy, flow)) {
        const desired = flow.branchName ?? `mcp/${selectedMode?.id ?? "run"}/${run.runId.slice(0, 8)}`;
        try {
            await gitCreateBranch(deps.policy, desired);
            run.git = { ...(run.git ?? {}), branch: desired };
            transition(run, "BRANCHED", `Created branch ${desired}`);
        }
        catch {
            // Branch creation failed, continue without branching
        }
    }
    if (canAutoCommit(deps.policy, flow)) {
        const msg = flow.commitMessage ?? (out.pr?.title ? String(out.pr.title).slice(0, 120) : `mcp: ${selectedMode?.id ?? "change"}`);
        try {
            const sha = await gitCommit(deps.policy, msg, true, !!flow.dryRun);
            run.git = { ...(run.git ?? {}), commitSha: sha };
            transition(run, "COMMITTED", `Committed ${sha}`);
        }
        catch {
            // Commit failed, continue without committing
        }
    }
    const bundle = {
        meta: {
            sessionId: run.sessionId,
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
    const written = await writeBundle(deps.policy, run.sessionId, bundle);
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
        nextStep: { kind: "done", message: "Done. Bundle created." },
    };
}
export async function orchestrateStatus(deps, runId) {
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
export async function orchestrateCancel(deps, runId) {
    const run = await loadRun(deps.policy, runId);
    if (run.state === "DONE" || run.state === "FAILED")
        return run;
    transition(run, "CANCELLED", "Cancelled by user");
    await saveRun(deps.policy, run);
    return run;
}
