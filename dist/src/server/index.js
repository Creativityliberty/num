import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { performance } from "node:perf_hooks";
import { z } from "zod";
import { buildDeterministicPlan } from "../core/planner.js";
import { ModeRegistry } from "../core/registry.js";
import { renderPromptPack } from "../core/renderer.js";
import { suggestModes } from "../core/router.js";
import { buildReviewPrompt, buildRunPrompt } from "../core/runpack.js";
import { AgentsMergeDecisionInputSchema, AgentsMergeDecisionResultSchema, AgentsNextInputSchema, AgentsNextResultSchema, AgentsPlanInputSchema, AgentsSubmitInputSchema, AgentsSubmitResultSchema, BundlePrCreateInputSchema, ExecRunInputSchema, GitBranchCreateInputSchema, GitCommitInputSchema, GitDiffInputSchema, GitLogInputSchema, GitStatusInputSchema, ModelTelemetryEventSchema, ModesGetInputSchema, ModesListInputSchema, ModesPlanInputSchema, ModesPlanPromptInputSchema, ModesRenderInputSchema, ModesReviewPromptInputSchema, ModesRunPromptInputSchema, ModesSuggestInputSchema, OrchestrateCancelInputSchema, OrchestrateContinueInputSchema, OrchestrateRunInputSchema, OrchestrateStatusInputSchema, PipelineApplyAndVerifyInputSchema, WorkspaceApplyPatchInputSchema } from "../core/schemas.js";
import { ensureSessionId } from "../obs/session.js";
import { AgentsEngine } from "./agents/engine.js";
import { writeBundle } from "./bundle.js";
import { runCommandWithPolicy } from "./exec.js";
import { gitCommit, gitCreateBranch, gitDiff, gitLog, gitStatus } from "./git.js";
import { orchestrateCancel, orchestrateContinue, orchestrateStart, orchestrateStatus } from "./orchestrator/engine.js";
import { appendTelemetry } from "./orchestrator/store.js";
import { applyAndVerify } from "./pipeline.js";
import { applyUnifiedPatch, backupFiles, rollbackWorkspace } from "./workspace.js";
import { ExternalImportInputSchema, ExternalImportResultSchema } from "../core/externalImport.schema.js";
import { importExternalModes } from "./packs/importExternal.js";
export async function startMcpServer(opts) {
    const registry = await ModeRegistry.fromPaths(opts.modesPaths);
    opts.bus.emitEvent("runtime.started", {
        sessionId: "runtime",
        data: { modesCount: registry.count(), modesPaths: opts.modesPaths, workspaceRoot: opts.policy.workspaceRoot },
    });
    const server = new McpServer({
        name: "mcp-agents-modes",
        version: "0.1.0",
    });
    server.tool("modes.list", "List available modes (normalized).", {
        query: z.string().optional().describe("Full-text query (id/name/description/tags)"),
        tag: z.string().optional().describe("Filter by tag"),
        category: z.string().optional().describe("Filter by category (first segment)"),
    }, async (raw) => {
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.list" } });
        const input = ModesListInputSchema.parse(raw);
        const modes = registry.list(input);
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.list",
                durationMs: Math.round(performance.now() - t0),
                meta: { count: modes.length },
            },
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        count: modes.length,
                        modes: modes.map((m) => ({
                            id: m.id,
                            name: m.name,
                            description: m.description,
                            tags: m.tags,
                            categoryPath: m.categoryPath,
                            sourcePath: m.source.path,
                        })),
                    }, null, 2),
                },
            ],
        };
    });
    server.tool("modes.get", "Get a mode by id (normalized, with source metadata).", {
        id: z.string().min(1).describe("Mode id (slug)"),
    }, async (raw) => {
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.get" } });
        const input = ModesGetInputSchema.parse(raw);
        const mode = registry.get(input.id);
        if (!mode) {
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: {
                    tool: "modes.get",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "MODE_NOT_FOUND", message: input.id },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "MODE_NOT_FOUND", id: input.id }) }],
            };
        }
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.get",
                durationMs: Math.round(performance.now() - t0),
                meta: { id: input.id },
            },
        });
        return {
            content: [{ type: "text", text: JSON.stringify(mode, null, 2) }],
        };
    });
    server.tool("modes.suggest", "Suggest the best mode(s) for a task (auto-engage). Returns ranked candidates with confidence.", {
        task: z.unknown(),
        topK: z.number().int().min(1).max(20).optional().default(5),
        sessionId: z.string().optional(),
    }, async (raw) => {
        const input = ModesSuggestInputSchema.parse(raw);
        const sessionId = ensureSessionId(raw.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.suggest" } });
        const all = registry.allModes();
        const suggestions = suggestModes(all, input.task, input.topK);
        const best = suggestions[0];
        const followups = [];
        if (!best || best.confidence < 0.55) {
            followups.push("Tu veux plutôt corriger un bug, ajouter une feature, ou faire un refactor ?");
            if (!input.task.context?.errors && !input.task.context?.diff) {
                followups.push("Tu as une erreur/stacktrace ou un diff à fournir ?");
            }
        }
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.suggest",
                durationMs: Math.round(performance.now() - t0),
                meta: { best: best?.modeId ?? null, confidence: best?.confidence ?? null },
            },
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        best: best ?? null,
                        candidates: suggestions,
                        followups,
                        sessionId,
                    }, null, 2),
                },
            ],
        };
    });
    server.tool("modes.render", "Render a universal prompt-pack for a given mode + task envelope.", {
        id: z.string().min(1),
        task: z.unknown(),
        outputFormat: z.enum(["auto", "plan", "patch", "checklist"]).optional(),
        sessionId: z.string().optional(),
    }, async (raw) => {
        const input = ModesRenderInputSchema.parse(raw);
        const sessionId = ensureSessionId(raw.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.render" } });
        const mode = registry.get(input.id);
        if (!mode) {
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: {
                    tool: "modes.render",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "MODE_NOT_FOUND", message: input.id },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "MODE_NOT_FOUND", id: input.id }) }],
            };
        }
        const pack = renderPromptPack(mode, input);
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.render",
                durationMs: Math.round(performance.now() - t0),
                meta: { id: input.id, outputFormat: pack.output.format },
            },
        });
        return {
            content: [{ type: "text", text: JSON.stringify({ sessionId, pack }, null, 2) }],
        };
    });
    server.tool("modes.plan", "Return a deterministic, server-side plan (no LLM). If modeId is omitted, auto-selects via suggest().", {
        sessionId: z.string().optional(),
        modeId: z.string().optional(),
        task: z.unknown(),
        style: z.enum(["plan", "checklist"]).optional(),
        depth: z.number().int().min(1).max(3).optional(),
    }, async (raw) => {
        const input = ModesPlanInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.plan" } });
        // Select mode (explicit > auto)
        let selectedMode = input.modeId ? registry.get(input.modeId) : undefined;
        let selectedMeta;
        if (!selectedMode) {
            const suggestions = suggestModes(registry.allModes(), input.task, 1);
            const best = suggestions[0];
            if (best) {
                selectedMode = registry.get(best.modeId);
                if (selectedMode)
                    selectedMeta = { id: selectedMode.id, name: selectedMode.name, confidence: best.confidence };
            }
        }
        else {
            selectedMeta = { id: selectedMode.id, name: selectedMode.name };
        }
        const plan = buildDeterministicPlan({
            sessionId,
            task: input.task,
            mode: selectedMode,
            style: input.style,
            depth: input.depth,
            selectedModeMeta: selectedMeta,
        });
        const phasesCount = plan.phases.length;
        const stepsCount = plan.phases.reduce((acc, p) => acc + p.steps.length, 0);
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.plan",
                durationMs: Math.round(performance.now() - t0),
                meta: { phasesCount, stepsCount, modeId: selectedMeta?.id ?? null },
            },
        });
        return {
            content: [{ type: "text", text: JSON.stringify(plan, null, 2) }],
        };
    });
    server.tool("modes.planPrompt", "Return a planning-only prompt pack (LLM-assisted plan generated by the IDE's chosen model). If modeId omitted, auto-selects via suggest().", {
        sessionId: z.string().optional(),
        modeId: z.string().optional(),
        task: z.unknown(),
        style: z.enum(["plan", "checklist"]).optional(),
        depth: z.number().int().min(1).max(3).optional(),
    }, async (raw) => {
        const input = ModesPlanPromptInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.planPrompt" } });
        // Select mode (explicit > auto)
        let selectedMode = input.modeId ? registry.get(input.modeId) : undefined;
        let selectedConfidence;
        if (!selectedMode) {
            const suggestions = suggestModes(registry.allModes(), input.task, 1);
            const best = suggestions[0];
            if (best) {
                selectedMode = registry.get(best.modeId);
                selectedConfidence = best.confidence;
            }
        }
        // Fallback: minimal mode-like object if none
        if (!selectedMode) {
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: {
                    tool: "modes.planPrompt",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "MODE_NOT_FOUND", message: input.modeId ?? "auto" },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "MODE_NOT_FOUND", id: input.modeId ?? null }) }],
            };
        }
        // Render a plan-oriented pack using the existing renderer
        const pack = renderPromptPack(selectedMode, {
            sessionId,
            id: selectedMode.id,
            task: input.task,
            outputFormat: input.style === "checklist" ? "checklist" : "plan",
        });
        // Inject strict planning instructions (planning-only)
        const depthHint = input.depth === 1
            ? "Keep it short: 4–7 steps total."
            : input.depth === 2
                ? "Medium detail: phases + actionable steps (8–15 steps)."
                : "High detail: include edge cases, rollback, and validation (15–25 steps).";
        const planningDeveloperAddon = [
            "",
            "=== PLANNING MODE (IMPORTANT) ===",
            "You must NOT implement code. Only produce a plan.",
            `Requested style: ${input.style}`,
            `Depth: ${input.depth}. ${depthHint}`,
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
        const out = {
            sessionId,
            selectedMode: { id: selectedMode.id, name: selectedMode.name, confidence: selectedConfidence },
            promptPack: {
                ...pack,
                developer: pack.developer + planningDeveloperAddon,
            },
        };
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.planPrompt",
                durationMs: Math.round(performance.now() - t0),
                meta: { modeId: selectedMode.id, confidence: selectedConfidence ?? null, style: input.style, depth: input.depth },
            },
        });
        return {
            content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
        };
    });
    // ============ ÉTAPE 6A — modes.runPrompt + modes.reviewPrompt ============
    server.tool("modes.runPrompt", "Return an implementation prompt-pack that forces the IDE model to output a structured bundle (patch + commands + PR).", {
        sessionId: z.string().optional(),
        modeId: z.string().optional(),
        task: z.unknown(),
    }, async (raw) => {
        const input = ModesRunPromptInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.runPrompt" } });
        // Select mode (explicit > auto)
        let selectedMode = input.modeId ? registry.get(input.modeId) : undefined;
        let selectedConfidence;
        if (!selectedMode) {
            const suggestions = suggestModes(registry.allModes(), input.task, 1);
            const best = suggestions[0];
            if (best) {
                selectedMode = registry.get(best.modeId);
                selectedConfidence = best.confidence;
            }
        }
        if (!selectedMode) {
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: {
                    tool: "modes.runPrompt",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "MODE_NOT_FOUND", message: input.modeId ?? "auto" },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "MODE_NOT_FOUND", id: input.modeId ?? null }) }],
            };
        }
        const pack = buildRunPrompt(selectedMode, input.task);
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.runPrompt",
                durationMs: Math.round(performance.now() - t0),
                meta: { modeId: selectedMode.id, confidence: selectedConfidence ?? null },
            },
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        sessionId,
                        selectedMode: { id: selectedMode.id, name: selectedMode.name, confidence: selectedConfidence },
                        promptPack: pack,
                    }, null, 2),
                },
            ],
        };
    });
    server.tool("modes.reviewPrompt", "Return a review prompt-pack that forces the IDE model to output structured findings (severity, issues, approval).", {
        sessionId: z.string().optional(),
        modeId: z.string().min(1),
        patch: z.string().min(1).describe("Unified diff to review"),
    }, async (raw) => {
        const input = ModesReviewPromptInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "modes.reviewPrompt" } });
        const mode = registry.get(input.modeId);
        if (!mode) {
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: {
                    tool: "modes.reviewPrompt",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "MODE_NOT_FOUND", message: input.modeId },
                },
            });
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "MODE_NOT_FOUND", id: input.modeId }) }],
            };
        }
        const pack = buildReviewPrompt(mode, input.patch);
        opts.bus.emitEvent("tool.succeeded", {
            sessionId,
            data: {
                tool: "modes.reviewPrompt",
                durationMs: Math.round(performance.now() - t0),
                meta: { modeId: mode.id, patchBytes: input.patch.length },
            },
        });
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        sessionId,
                        mode: { id: mode.id, name: mode.name },
                        promptPack: pack,
                    }, null, 2),
                },
            ],
        };
    });
    // ============ ÉTAPE 6B — workspace.applyPatch + exec.run ============
    server.tool("workspace.applyPatch", "Validate and optionally apply a unified diff to the workspace. Use dryRun=true for validation only.", {
        sessionId: z.string(),
        diff: z.string().min(1),
        workspaceRoot: z.string().min(1),
        dryRun: z.boolean().optional(),
    }, async (raw) => {
        const input = WorkspaceApplyPatchInputSchema.parse(raw);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId: input.sessionId, data: { tool: "workspace.applyPatch", dryRun: input.dryRun } });
        const result = applyUnifiedPatch(input.workspaceRoot, input.diff, input.dryRun);
        if (result.errors.length > 0) {
            opts.bus.emitEvent("tool.failed", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.applyPatch",
                    durationMs: Math.round(performance.now() - t0),
                    error: { code: "PATCH_ERROR", errors: result.errors },
                },
            });
        }
        else {
            opts.bus.emitEvent("tool.succeeded", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.applyPatch",
                    durationMs: Math.round(performance.now() - t0),
                    meta: {
                        applied: result.applied,
                        dryRun: result.dryRun,
                        filesChanged: result.filesChanged,
                        insertions: result.insertions,
                        deletions: result.deletions,
                    },
                },
            });
        }
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    });
    // ============ ÉTAPE 11.3 — workspace.backup + workspace.rollback ============
    server.tool("workspace.backup", "Backup files (usually before applyPatch) into .mcp/backups/<runId>/", {
        sessionId: z.string(),
        runId: z.string().min(1),
        files: z.array(z.string().min(1)).min(1),
    }, async (raw) => {
        const input = raw;
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId: input.sessionId, data: { tool: "workspace.backup", runId: input.runId } });
        try {
            const result = await backupFiles({
                workspaceRoot: opts.policy.workspaceRoot,
                policy: opts.policy,
                runId: input.runId,
                files: input.files,
            });
            opts.bus.emitEvent("tool.succeeded", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.backup",
                    durationMs: Math.round(performance.now() - t0),
                    meta: { runId: input.runId, filesCount: result.files.length },
                },
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (err) {
            opts.bus.emitEvent("tool.failed", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.backup",
                    durationMs: Math.round(performance.now() - t0),
                    error: { message: String(err) },
                },
            });
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: String(err) }) }] };
        }
    });
    server.tool("workspace.rollback", "Rollback workspace files from .mcp/backups/<runId>/", {
        sessionId: z.string(),
        runId: z.string().min(1),
    }, async (raw) => {
        const input = raw;
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId: input.sessionId, data: { tool: "workspace.rollback", runId: input.runId } });
        try {
            const result = await rollbackWorkspace({
                workspaceRoot: opts.policy.workspaceRoot,
                policy: opts.policy,
                runId: input.runId,
            });
            opts.bus.emitEvent("tool.succeeded", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.rollback",
                    durationMs: Math.round(performance.now() - t0),
                    meta: { runId: input.runId, restoredCount: result.restoredCount },
                },
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (err) {
            opts.bus.emitEvent("tool.failed", {
                sessionId: input.sessionId,
                data: {
                    tool: "workspace.rollback",
                    durationMs: Math.round(performance.now() - t0),
                    error: { message: String(err) },
                },
            });
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: String(err) }) }] };
        }
    });
    server.tool("exec.run", "Execute an allowlisted command (cmd + args, no shell) in a sandboxed environment with timeout and output limits.", {
        sessionId: z.string(),
        cmd: z.string().min(1).describe("Executable name (no path, no whitespace)"),
        args: z.array(z.string()).optional().default([]).describe("Arguments array"),
        cwd: z.string().optional().describe("Working directory (relative to workspace root)"),
        timeoutMs: z.number().int().min(1000).max(120000).optional(),
    }, async (raw) => {
        const input = ExecRunInputSchema.parse(raw);
        const t0 = performance.now();
        const commandStr = [input.cmd, ...input.args].join(" ").trim();
        opts.bus.emitEvent("tool.called", { sessionId: input.sessionId, data: { tool: "exec.run", command: commandStr } });
        const result = await runCommandWithPolicy(opts.policy, {
            cmd: input.cmd,
            args: input.args,
            cwd: input.cwd,
            timeoutMs: input.timeoutMs,
        });
        if (result.exitCode !== 0) {
            opts.bus.emitEvent("tool.failed", {
                sessionId: input.sessionId,
                data: {
                    tool: "exec.run",
                    durationMs: Math.round(performance.now() - t0),
                    error: { exitCode: result.exitCode, stderr: result.stderr.slice(0, 500) },
                },
            });
        }
        else {
            opts.bus.emitEvent("tool.succeeded", {
                sessionId: input.sessionId,
                data: {
                    tool: "exec.run",
                    durationMs: Math.round(performance.now() - t0),
                    meta: { exitCode: result.exitCode, durationMs: result.durationMs, truncated: result.truncated },
                },
            });
        }
        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
    });
    // ============ ÉTAPE 7 — Git / Pipeline / Bundle tools ============
    server.tool("git.status", "Get git status (porcelain) for the workspaceRoot (policy-controlled).", {
        sessionId: z.string().optional(),
    }, async (raw) => {
        const input = GitStatusInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "git.status" } });
        try {
            const s = await gitStatus(opts.policy);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "git.status", durationMs: Math.round(performance.now() - t0), meta: { branch: s.branch } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, ...s }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "git.status", durationMs: Math.round(performance.now() - t0), error: { code: "GIT_STATUS_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "GIT_STATUS_FAILED", message: msg }) }] };
        }
    });
    server.tool("git.diff", "Get git diff for workspaceRoot (policy-controlled).", {
        sessionId: z.string().optional(),
        staged: z.boolean().optional(),
        paths: z.array(z.string()).optional(),
    }, async (raw) => {
        const input = GitDiffInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "git.diff" } });
        try {
            const d = await gitDiff(opts.policy, input.staged, input.paths);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "git.diff", durationMs: Math.round(performance.now() - t0), meta: { bytes: d.length, staged: input.staged } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, diff: d }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "git.diff", durationMs: Math.round(performance.now() - t0), error: { code: "GIT_DIFF_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "GIT_DIFF_FAILED", message: msg }) }] };
        }
    });
    server.tool("git.log", "Get git log summary for workspaceRoot (policy-controlled).", {
        sessionId: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
    }, async (raw) => {
        const input = GitLogInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "git.log" } });
        try {
            const out = await gitLog(opts.policy, input.limit);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "git.log", durationMs: Math.round(performance.now() - t0), meta: { limit: input.limit } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, log: out }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "git.log", durationMs: Math.round(performance.now() - t0), error: { code: "GIT_LOG_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "GIT_LOG_FAILED", message: msg }) }] };
        }
    });
    server.tool("git.branch.create", "Create a git branch (policy-controlled, prefix allowlist).", {
        sessionId: z.string().optional(),
        name: z.string().min(3).max(80),
    }, async (raw) => {
        const input = GitBranchCreateInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "git.branch.create" } });
        try {
            await gitCreateBranch(opts.policy, input.name);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "git.branch.create", durationMs: Math.round(performance.now() - t0), meta: { name: input.name } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, ok: true, name: input.name }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "git.branch.create", durationMs: Math.round(performance.now() - t0), error: { code: "GIT_BRANCH_CREATE_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "GIT_BRANCH_CREATE_FAILED", message: msg }) }] };
        }
    });
    server.tool("git.commit", "Commit changes (policy-controlled). Optionally add -A. Supports dryRun.", {
        sessionId: z.string().optional(),
        message: z.string().min(1),
        addAll: z.boolean().optional(),
        dryRun: z.boolean().optional(),
    }, async (raw) => {
        const input = GitCommitInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "git.commit" } });
        try {
            const sha = await gitCommit(opts.policy, input.message, input.addAll, input.dryRun);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "git.commit", durationMs: Math.round(performance.now() - t0), meta: { commitSha: sha, dryRun: input.dryRun } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, commitSha: sha, dryRun: input.dryRun }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "git.commit", durationMs: Math.round(performance.now() - t0), error: { code: "GIT_COMMIT_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "GIT_COMMIT_FAILED", message: msg }) }] };
        }
    });
    server.tool("pipeline.applyAndVerify", "Apply a patch and run verification commands (policy-controlled). Stops on first failure.", {
        sessionId: z.string().optional(),
        diff: z.string().min(1),
        commands: z.array(z.string()).optional(),
        dryRun: z.boolean().optional(),
        timeoutMs: z.number().int().min(1000).max(120000).optional(),
    }, async (raw) => {
        const input = PipelineApplyAndVerifyInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "pipeline.applyAndVerify" } });
        try {
            const res = await applyAndVerify({
                policy: opts.policy,
                diff: input.diff,
                commands: input.commands,
                dryRun: input.dryRun,
                timeoutMs: input.timeoutMs,
            });
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: {
                    tool: "pipeline.applyAndVerify",
                    durationMs: Math.round(performance.now() - t0),
                    meta: { dryRun: input.dryRun, commandsCount: input.commands.length, failedAt: res.failedAt },
                },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, ...res }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "pipeline.applyAndVerify", durationMs: Math.round(performance.now() - t0), error: { code: "PIPELINE_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "PIPELINE_FAILED", message: msg }) }] };
        }
    });
    server.tool("bundle.pr.create", "Create an exportable PR bundle for the session. Optionally writes .mcp/bundles/<sessionId>.json", {
        sessionId: z.string().optional(),
        modeId: z.string().optional(),
        task: z.unknown().optional(),
        plan: z.unknown().optional(),
        runOutput: z.unknown().optional(),
        reviewOutput: z.unknown().optional(),
        execResults: z.unknown().optional(),
        git: z.object({ branch: z.string().optional(), commitSha: z.string().optional() }).optional(),
        writeFile: z.boolean().optional(),
    }, async (raw) => {
        const input = BundlePrCreateInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "bundle.pr.create" } });
        const bundle = {
            meta: {
                sessionId,
                createdAt: new Date().toISOString(),
                workspaceRoot: opts.policy.workspaceRoot,
                modeId: input.modeId ?? null,
            },
            task: input.task ?? null,
            plan: input.plan ?? null,
            runOutput: input.runOutput ?? null,
            reviewOutput: input.reviewOutput ?? null,
            execResults: input.execResults ?? null,
            git: input.git ?? null,
        };
        try {
            let writtenPath = null;
            if (input.writeFile) {
                writtenPath = await writeBundle(opts.policy, sessionId, bundle);
            }
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "bundle.pr.create", durationMs: Math.round(performance.now() - t0), meta: { writtenPath } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ sessionId, writtenPath, bundle }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "bundle.pr.create", durationMs: Math.round(performance.now() - t0), error: { code: "BUNDLE_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "BUNDLE_FAILED", message: msg }) }] };
        }
    });
    // ============ ÉTAPE 8 — Orchestrator tools ============
    server.tool("orchestrate.run", "Start an orchestration run (LLM-in-the-loop via orchestrate.continue).", {
        sessionId: z.string().optional(),
        task: z.object({
            goal: z.string(),
            context: z.record(z.unknown()).optional(),
        }),
        modeId: z.string().optional(),
        flow: z.object({
            usePlanPrompt: z.boolean().optional(),
            useReview: z.boolean().optional(),
            autoApply: z.boolean().optional(),
            autoCommit: z.boolean().optional(),
            createBranch: z.boolean().optional(),
            branchName: z.string().optional(),
            commitMessage: z.string().optional(),
            dryRun: z.boolean().optional(),
            maxFixIterations: z.number().int().min(0).max(5).optional(),
        }).optional(),
    }, async (raw) => {
        const input = OrchestrateRunInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "orchestrate.run" } });
        try {
            const res = await orchestrateStart({ policy: opts.policy, bus: opts.bus, registry }, input);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "orchestrate.run", durationMs: Math.round(performance.now() - t0), meta: { runId: res.runId, state: res.state } },
            });
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "orchestrate.run", durationMs: Math.round(performance.now() - t0), error: { code: "ORCH_RUN_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "ORCH_RUN_FAILED", message: msg }) }] };
        }
    });
    server.tool("orchestrate.continue", "Continue an orchestration run by submitting LLM outputs (plan/run/review).", {
        runId: z.string().min(8),
        sessionId: z.string().optional(),
        stepId: z.enum(["plan", "run", "review"]),
        payload: z.unknown(),
    }, async (raw) => {
        const input = OrchestrateContinueInputSchema.parse(raw);
        const sessionId = ensureSessionId(input.sessionId);
        const t0 = performance.now();
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "orchestrate.continue", meta: { runId: input.runId, stepId: input.stepId } } });
        try {
            const res = await orchestrateContinue({ policy: opts.policy, bus: opts.bus, registry }, input);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "orchestrate.continue", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, state: res.state } },
            });
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "orchestrate.continue", durationMs: Math.round(performance.now() - t0), error: { code: "ORCH_CONTINUE_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "ORCH_CONTINUE_FAILED", message: msg }) }] };
        }
    });
    server.tool("orchestrate.status", "Get current orchestration status.", {
        runId: z.string().min(8),
    }, async (raw) => {
        const input = OrchestrateStatusInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "orchestrate.status", meta: { runId: input.runId } } });
        try {
            const res = await orchestrateStatus({ policy: opts.policy }, input.runId);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "orchestrate.status", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, state: res.state } },
            });
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "orchestrate.status", durationMs: Math.round(performance.now() - t0), error: { code: "ORCH_STATUS_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "ORCH_STATUS_FAILED", message: msg }) }] };
        }
    });
    server.tool("orchestrate.cancel", "Cancel an orchestration run.", {
        runId: z.string().min(8),
    }, async (raw) => {
        const input = OrchestrateCancelInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "orchestrate.cancel", meta: { runId: input.runId } } });
        try {
            const res = await orchestrateCancel({ policy: opts.policy }, input.runId);
            const state = res.state ?? "unknown";
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "orchestrate.cancel", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, state } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ ok: true, runId: input.runId, state }, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "orchestrate.cancel", durationMs: Math.round(performance.now() - t0), error: { code: "ORCH_CANCEL_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "ORCH_CANCEL_FAILED", message: msg }) }] };
        }
    });
    // =========================
    // Step 12.1 — Multi-agents (Serial)
    // =========================
    const agentsEngine = new AgentsEngine({ policy: opts.policy });
    server.tool("agents.plan", "Create a serial multi-agent run (planner→implementer→reviewer→security). Returns runId.", {
        task: z.object({
            goal: z.string().min(1).describe("The task goal"),
            context: z.any().optional().describe("Optional context (JSON)"),
        }),
        flow: z
            .object({
            autoApply: z.boolean().optional().default(false),
            useReview: z.boolean().optional().default(true),
            useSecurity: z.boolean().optional().default(true),
            createBranch: z.boolean().optional().default(false),
            autoCommit: z.boolean().optional().default(false),
            dryRun: z.boolean().optional().default(false),
            maxFixIterations: z.number().int().min(0).max(10).optional().default(2),
        })
            .optional()
            .default({}),
    }, async (raw) => {
        const input = AgentsPlanInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "agents.plan", meta: { goal: input.task.goal } } });
        try {
            const result = await agentsEngine.plan(input);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "agents.plan", durationMs: Math.round(performance.now() - t0), meta: { runId: result.runId } },
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "agents.plan", durationMs: Math.round(performance.now() - t0), error: { code: "AGENTS_PLAN_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "AGENTS_PLAN_FAILED", message: msg }) }] };
        }
    });
    server.tool("agents.next", "Get next pending job + promptPack + expected schema.", {
        runId: z.string().min(1).describe("Run ID from agents.plan"),
    }, async (raw) => {
        const input = AgentsNextInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "agents.next", meta: { runId: input.runId } } });
        try {
            const result = await agentsEngine.next(input);
            const parsed = AgentsNextResultSchema.parse(result);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "agents.next", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, status: parsed.status, jobId: parsed.job?.jobId } },
            });
            return { content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "agents.next", durationMs: Math.round(performance.now() - t0), error: { code: "AGENTS_NEXT_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "AGENTS_NEXT_FAILED", message: msg }) }] };
        }
    });
    server.tool("agents.submit", "Submit job payload (validated) and advance state.", {
        runId: z.string().min(1).describe("Run ID"),
        jobId: z.string().min(1).describe("Job ID"),
        role: z.enum(["planner", "implementer", "reviewer", "security"]).describe("Agent role"),
        payload: z.any().describe("Job output payload (validated by role schema)"),
    }, async (raw) => {
        const input = AgentsSubmitInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "agents.submit", meta: { runId: input.runId, jobId: input.jobId, role: input.role } } });
        try {
            const result = await agentsEngine.submit(input);
            const parsed = AgentsSubmitResultSchema.parse(result);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "agents.submit", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, jobId: input.jobId, ok: parsed.ok, status: parsed.status } },
            });
            return { content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "agents.submit", durationMs: Math.round(performance.now() - t0), error: { code: "AGENTS_SUBMIT_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "AGENTS_SUBMIT_FAILED", message: msg }) }] };
        }
    });
    // 12.3: agents.mergeDecision tool
    server.tool("agents.mergeDecision", "Choose best candidate among multiple implementers and materialize chosen patchCandidate/runOutput.", {
        runId: z.string().min(1).describe("Run ID"),
        decision: z.object({
            chosenCandidateId: z.string().min(1).describe("Chosen candidate ID"),
            rationale: z.string().optional().describe("Rationale for choice"),
            requiredFixes: z.array(z.string()).optional().describe("Required fixes before apply"),
        }),
    }, async (raw) => {
        const input = AgentsMergeDecisionInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "agents.mergeDecision", meta: { runId: input.runId, chosenCandidateId: input.decision.chosenCandidateId } } });
        try {
            const result = await agentsEngine.mergeDecision(input);
            const parsed = AgentsMergeDecisionResultSchema.parse(result);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "agents.mergeDecision", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, ok: parsed.ok } },
            });
            return { content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "agents.mergeDecision", durationMs: Math.round(performance.now() - t0), error: { code: "AGENTS_MERGE_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ error: "AGENTS_MERGE_FAILED", message: msg }) }] };
        }
    });
    // 19.3: runs.telemetry.append tool
    server.tool("runs.telemetry.append", "Append model telemetry event to a run (chosen model, attempts, usage). Best-effort, non-blocking.", {
        runId: z.string().min(1).describe("Run ID"),
        event: z.object({
            ts: z.string().describe("ISO timestamp"),
            runId: z.string(),
            stepId: z.string().optional(),
            jobId: z.string().optional(),
            role: z.string().optional(),
            chosenModel: z.object({ provider: z.string(), model: z.string() }).optional(),
            attempts: z.array(z.object({
                model: z.object({ provider: z.string(), model: z.string() }),
                ok: z.boolean(),
                reason: z.string().optional(),
                transient: z.boolean().optional(),
            })).optional(),
            usage: z.object({
                inputTokens: z.number().optional(),
                outputTokens: z.number().optional(),
                costUsd: z.number().optional(),
            }).optional(),
        }).describe("Telemetry event"),
    }, async (raw) => {
        const input = z.object({ runId: z.string(), event: ModelTelemetryEventSchema }).parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "runs.telemetry.append", meta: { runId: input.runId } } });
        try {
            if (opts.policy.allowWrite === false) {
                return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowWrite=false" }) }] };
            }
            const result = await appendTelemetry(opts.policy, input.runId, input.event);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "runs.telemetry.append", durationMs: Math.round(performance.now() - t0), meta: { runId: input.runId, count: result.count } },
            });
            return { content: [{ type: "text", text: JSON.stringify(result) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "runs.telemetry.append", durationMs: Math.round(performance.now() - t0), error: { code: "TELEMETRY_APPEND_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "TELEMETRY_APPEND_FAILED", message: msg }) }] };
        }
    });
    // 20: pack.import.external tool
    server.tool("pack.import.external", "Import external agents (YAML or doc dump) into Num modes + pack.json.", {
        sourceType: z.enum(["customModesYaml", "docDump"]).describe("Source type: customModesYaml or docDump"),
        inputPath: z.string().describe("Path to input file or directory"),
        outModesDir: z.string().default("./modes/num").describe("Output directory for modes"),
        packId: z.string().default("num-pack").describe("Pack ID"),
        packOutDir: z.string().default("./packs/num-pack").describe("Output directory for pack.json"),
        dryRun: z.boolean().optional().default(false).describe("If true, do not write files"),
        idPrefix: z.string().optional().default("num:").describe("Prefix for mode IDs"),
    }, async (raw) => {
        const input = ExternalImportInputSchema.parse(raw);
        const t0 = performance.now();
        const sessionId = "runtime";
        opts.bus.emitEvent("tool.called", { sessionId, data: { tool: "pack.import.external", meta: { sourceType: input.sourceType, inputPath: input.inputPath } } });
        try {
            if (opts.policy.allowWrite === false && !input.dryRun) {
                return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowWrite=false" }) }] };
            }
            const result = await importExternalModes(input);
            opts.bus.emitEvent("tool.succeeded", {
                sessionId,
                data: { tool: "pack.import.external", durationMs: Math.round(performance.now() - t0), meta: { importedCount: result.importedCount } },
            });
            return { content: [{ type: "text", text: JSON.stringify(ExternalImportResultSchema.parse(result)) }] };
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            opts.bus.emitEvent("tool.failed", {
                sessionId,
                data: { tool: "pack.import.external", durationMs: Math.round(performance.now() - t0), error: { code: "IMPORT_FAILED", message: msg } },
            });
            return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "IMPORT_FAILED", message: msg }) }] };
        }
    });
    // stdio transport + connect
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`mcp-agents-modes: loaded ${registry.count()} modes (stdio)`);
}
