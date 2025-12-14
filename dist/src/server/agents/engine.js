import crypto from "node:crypto";
import { resolveRuntimePolicy } from "../../core/policy.resolve.js";
import { AgentsMergeDecisionInputSchema, AgentsNextResultSchema, AgentsPlanInputSchema, AgentsSubmitInputSchema, ApplyPayloadSchema, JobSchema, MergeDecisionSchema, MultiPlanSchema, PatchCandidateSchema, ReviewReportSchema, SecurityReportSchema } from "../../core/schemas.js";
import { saveRun, tryLoadRun } from "../orchestrator/store.js";
import { buildJobsFromFlow, normalizeFlowSpec, renderTemplate } from "./flowdsl.js";
function nowIso() {
    return new Date().toISOString();
}
function newId(prefix) {
    return `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
}
function buildPromptPack(role, run, _job) {
    const task = run.task ?? {};
    const context = task.context ?? {};
    if (role === "planner") {
        return {
            system: "You are PlannerAgent. Produce STRICT JSON only. No prose. Output must match MultiPlanSchema: {jobs:[{jobId,role,goal,dependsOn?,status?}], acceptanceCriteria?, notes?}.",
            user: `Task goal:\n${task.goal}\n\nContext (may be JSON):\n${JSON.stringify(context, null, 2)}\n\n` +
                `Create a SERIAL plan with jobs roles in order: planner -> implementer -> reviewer -> security.\n` +
                `Use stable jobIds: plan, implement, review, security.\n` +
                `Return ONLY JSON.`,
        };
    }
    if (role === "implementer") {
        return {
            system: "You are ImplementerAgent. Produce STRICT JSON only. Output must match PatchCandidateSchema: {candidateId, patch, commands:[{cmd,args[]}], rationale?}. " +
                "Patch must be unified diff. Commands must be safe and minimal (e.g., npm test).",
            user: `Task goal:\n${task.goal}\n\nContext:\n${JSON.stringify(context, null, 2)}\n\n` +
                `Constraints:\n- Provide a single patch candidate.\n- Keep changes minimal.\n- Commands must use cmd/args format.\n- Return ONLY JSON.`,
        };
    }
    if (role === "reviewer") {
        const cand = run.agents?.artifacts?.patchCandidate;
        return {
            system: "You are ReviewerAgent. Produce STRICT JSON only. Output must match ReviewReportSchema: {verdict: approve|changes|reject, summary?, findings:[{severity,type,message,files?}]}.",
            user: `Task goal:\n${task.goal}\n\nPatchCandidate:\n${JSON.stringify(cand ?? {}, null, 2)}\n\n` +
                `Review for correctness, style, and risks. Return ONLY JSON.`,
        };
    }
    // 12.3: arbiter for merge decision
    if (role === "arbiter") {
        const cands = run.agents?.artifacts?.candidates ?? [];
        return {
            system: "You are ArbiterAgent. Choose the best patch candidate. Output STRICT JSON only matching MergeDecisionSchema: {chosenCandidateId, rationale?, requiredFixes?[]}.",
            user: `Task goal:\n${task.goal}\n\nCandidates:\n${JSON.stringify(cands, null, 2)}\n\n` +
                `Choose the best candidateId and return ONLY JSON.`,
        };
    }
    // security
    const cand = run.agents?.artifacts?.patchCandidate;
    return {
        system: "You are SecurityAgent. Produce STRICT JSON only. Output must match SecurityReportSchema: {verdict: allow|block|manualConfirm, summary?, issues:[{type,message,severity}]}.",
        user: `Task goal:\n${task.goal}\n\nPatchCandidate:\n${JSON.stringify(cand ?? {}, null, 2)}\n\n` +
            `Assess safety: file scope, secrets, exec commands. If unsure require manualConfirm. Return ONLY JSON.`,
    };
}
export class AgentsEngine {
    policy;
    modes;
    constructor(opts) {
        this.policy = opts.policy;
        this.modes = opts.modes;
    }
    async plan(input) {
        const parsed = AgentsPlanInputSchema.parse(input);
        const runId = newId("run");
        const sessionId = newId("session");
        const now = nowIso();
        // 12.6: If DSL provided, use it; else if modeId, load from mode; else default
        let flowSpec = null;
        let jobs = null;
        let historyNote = "agents.plan (default)";
        if (parsed.dsl) {
            flowSpec = normalizeFlowSpec(parsed.dsl);
            jobs = buildJobsFromFlow(flowSpec);
            historyNote = "agents.plan (dsl)";
        }
        else if (parsed.modeId) {
            if (!this.modes)
                throw new Error("AgentsEngine: modeId provided but modes store not configured");
            const mode = await this.modes.get(parsed.modeId);
            if (!mode.flow)
                throw new Error(`Mode '${parsed.modeId}' has no flow`);
            flowSpec = normalizeFlowSpec(mode.flow);
            jobs = buildJobsFromFlow(flowSpec);
            historyNote = `agents.plan (modeId=${parsed.modeId})`;
        }
        const run = {
            runId,
            sessionId,
            createdAt: now,
            updatedAt: now,
            state: "NEEDS_PLAN",
            task: { goal: parsed.task.goal, context: parsed.task.context ?? {} },
            flow: {
                autoApply: parsed.flow.autoApply,
                useReview: parsed.flow.useReview,
                useSecurity: parsed.flow.useSecurity,
                createBranch: parsed.flow.createBranch,
                autoCommit: parsed.flow.autoCommit,
                dryRun: parsed.flow.dryRun,
                maxFixIterations: parsed.flow.maxFixIterations,
            },
            selectedMode: { id: parsed.modeId ?? "agents-consensus", name: parsed.modeId ?? "agents-consensus", confidence: 1 },
            fixIterations: 0,
            history: [{ ts: now, from: "INIT", to: "NEEDS_PLAN", note: historyNote }],
            agents: {
                jobs: jobs ?? [
                    { jobId: "plan", role: "planner", goal: "Create an execution plan", dependsOn: [], status: "pending" },
                    { jobId: "implementA", role: "implementer", goal: "Implement candidate A (patch + commands)", dependsOn: ["plan"], status: "pending" },
                    { jobId: "implementB", role: "implementer", goal: "Implement candidate B (patch + commands)", dependsOn: ["plan"], status: "pending" },
                    { jobId: "merge", role: "arbiter", goal: "Choose best candidate", dependsOn: ["implementA", "implementB"], status: "pending" },
                    { jobId: "review", role: "reviewer", goal: "Review chosen patch candidate", dependsOn: ["merge"], status: "pending" },
                    { jobId: "security", role: "security", goal: "Security/policy assessment", dependsOn: ["merge"], status: "pending" },
                ],
                artifacts: { candidates: [], flow: flowSpec ?? undefined, byNode: {} },
                activeJobId: undefined,
                fixIterations: 0,
                parallelReview: parsed.flow.parallelReview ?? true,
                consensusImplement: parsed.flow.consensusImplement ?? true,
            },
        };
        await saveRun(this.policy, run);
        return { runId, sessionId };
    }
    async next(input) {
        const { runId } = input;
        const parsed = await tryLoadRun(this.policy, runId);
        if (!parsed) {
            return AgentsNextResultSchema.parse({
                runId,
                sessionId: undefined,
                job: null,
                expectedSchema: null,
                promptPack: null,
                applyPayload: null,
                status: "failed",
                message: "Run not found",
            });
        }
        // Cast to mutable for updates
        const run = parsed;
        // 12.1.1: build applyPayload from patchCandidate if available
        const buildApplyPayload = () => {
            const cand = run.agents?.artifacts?.patchCandidate;
            if (!cand?.patch)
                return null;
            return ApplyPayloadSchema.parse({ patch: cand.patch, commands: cand.commands ?? [] });
        };
        // If already ready to apply, return manual step.
        if (run.state === "READY_TO_APPLY") {
            return AgentsNextResultSchema.parse({
                runId,
                sessionId: run.sessionId,
                job: null,
                expectedSchema: null,
                promptPack: null,
                applyPayload: buildApplyPayload(),
                status: "manual",
                message: "Ready to apply. Use pipeline.applyAndVerify then git/bundle tools as allowed by policy.",
                suggestedTools: ["pipeline.applyAndVerify", "git.branch.create", "git.commit", "bundle.pr.create"],
            });
        }
        if (run.state === "DONE") {
            return AgentsNextResultSchema.parse({
                runId,
                sessionId: run.sessionId,
                job: null,
                expectedSchema: null,
                promptPack: null,
                applyPayload: null,
                status: "done",
                message: "Run done",
            });
        }
        if (run.state === "FAILED") {
            return AgentsNextResultSchema.parse({
                runId,
                sessionId: run.sessionId,
                job: null,
                expectedSchema: null,
                promptPack: null,
                applyPayload: null,
                status: "failed",
                message: run.error?.message ?? "Run failed",
            });
        }
        const jobs = run.agents?.jobs ?? [];
        const artifacts = run.agents?.artifacts ?? {};
        // 12.2: pick all runnable pending jobs (parallel-safe)
        const done = new Set(jobs.filter((j) => j.status === "done").map((j) => j.jobId));
        const runnable = jobs.filter((j) => {
            if (j.status !== "pending")
                return false;
            const deps = j.dependsOn ?? [];
            return deps.every((d) => done.has(d));
        });
        // Pick first runnable (parallel: reviewer and security can both be runnable)
        const nextJob = runnable[0];
        if (!nextJob) {
            // No pending job: decide readiness
            const reviewOk = (run.flow?.useReview ?? true) ? artifacts.review?.verdict === "approve" : true;
            const secOk = (run.flow?.useSecurity ?? true) ? artifacts.security?.verdict === "allow" : true;
            if (reviewOk && secOk && artifacts.patchCandidate?.patch) {
                run.state = "READY_TO_APPLY";
                run.updatedAt = nowIso();
                run.history = [...(run.history ?? []), { ts: run.updatedAt, from: "NEEDS_PLAN", to: "READY_TO_APPLY", note: "all jobs done" }];
                await saveRun(this.policy, run);
                return AgentsNextResultSchema.parse({
                    runId,
                    sessionId: run.sessionId,
                    job: null,
                    expectedSchema: null,
                    promptPack: null,
                    applyPayload: buildApplyPayload(),
                    status: "manual",
                    message: "Ready to apply. Use pipeline.applyAndVerify then git/bundle tools as allowed by policy.",
                    suggestedTools: ["pipeline.applyAndVerify", "git.branch.create", "git.commit", "bundle.pr.create"],
                });
            }
            return AgentsNextResultSchema.parse({
                runId,
                sessionId: run.sessionId,
                job: null,
                expectedSchema: null,
                promptPack: null,
                applyPayload: null,
                status: "failed",
                message: "No pending jobs but not ready to apply (missing artifacts or approvals).",
            });
        }
        // Mark running
        nextJob.status = "running";
        nextJob.startedAt = nowIso();
        run.agents.activeJobId = nextJob.jobId;
        run.updatedAt = nowIso();
        await saveRun(this.policy, run);
        const role = nextJob.role;
        // 12.6: if flow DSL present, use node.expectedSchema + templated prompt
        const flowSpec = run.agents?.artifacts?.flow;
        const node = flowSpec?.nodes?.find((n) => n.id === nextJob.jobId);
        let expectedSchema;
        let promptPack;
        // 13.1: resolve runtime policy (node > mode > pack > defaults)
        const runtimePolicy = resolveRuntimePolicy({
            node: node?.runtimePolicy,
            mode: run.selectedMode?.runtimePolicy,
            pack: run.selectedMode?.pack?.runtimePolicy,
            defaults: this.policy?.runtimeDefaults,
        });
        if (node) {
            expectedSchema = node.expectedSchema;
            const ctx = {
                task: run.task ?? {},
                flow: run.flow ?? {},
                artifacts: run.agents?.artifacts ?? {},
            };
            promptPack = {
                system: renderTemplate(node.prompt.system, ctx),
                user: renderTemplate(node.prompt.user, ctx),
            };
        }
        else {
            // Default: role-based schema
            expectedSchema =
                role === "planner"
                    ? "multiPlan"
                    : role === "arbiter"
                        ? "mergeDecision"
                        : role === "implementer"
                            ? "patchCandidate"
                            : role === "reviewer"
                                ? "reviewReport"
                                : "securityReport";
            promptPack = buildPromptPack(role, run, nextJob);
        }
        return AgentsNextResultSchema.parse({
            runId,
            sessionId: run.sessionId,
            job: JobSchema.parse(nextJob),
            expectedSchema,
            promptPack,
            applyPayload: null,
            status: "running",
            nodeId: node ? node.id : nextJob.jobId,
            runtimePolicy,
        });
    }
    async submit(input) {
        const parsedIn = AgentsSubmitInputSchema.parse(input);
        const run = (await tryLoadRun(this.policy, parsedIn.runId));
        if (!run) {
            return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: false, status: "failed", message: "Run not found" };
        }
        const jobs = run.agents?.jobs ?? [];
        const job = jobs.find((j) => j.jobId === parsedIn.jobId);
        if (!job) {
            return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: false, status: "failed", message: "Job not found" };
        }
        if (job.role !== parsedIn.role) {
            return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: false, status: "failed", message: "Role mismatch" };
        }
        // Validate payload by role
        const role = parsedIn.role;
        const artifacts = run.agents?.artifacts ?? {};
        try {
            if (role === "planner") {
                const mp = MultiPlanSchema.parse(parsedIn.payload);
                artifacts.multiPlan = mp;
            }
            else if (role === "implementer") {
                const cand = PatchCandidateSchema.parse(parsedIn.payload);
                // 12.3: store candidates (A/B) then merge decides chosen
                const list = Array.isArray(artifacts.candidates) ? artifacts.candidates : [];
                artifacts.candidates = [...list, cand];
            }
            else if (role === "reviewer") {
                const rr = ReviewReportSchema.parse(parsedIn.payload);
                artifacts.review = rr;
            }
            else if (role === "security") {
                const sr = SecurityReportSchema.parse(parsedIn.payload);
                artifacts.security = sr;
            }
            else if (role === "arbiter") {
                // arbiter payload is handled by agents.mergeDecision tool, not submit
                throw new Error("Use agents.mergeDecision for arbiter role");
            }
        }
        catch (e) {
            job.status = "failed";
            job.finishedAt = nowIso();
            run.updatedAt = nowIso();
            await saveRun(this.policy, run);
            return {
                runId: parsedIn.runId,
                jobId: parsedIn.jobId,
                ok: false,
                status: "failed",
                message: `Schema validation failed: ${String(e?.message ?? e)}`,
            };
        }
        // Mark done
        job.status = "done";
        job.finishedAt = nowIso();
        run.agents.artifacts = artifacts;
        run.agents.activeJobId = undefined;
        run.updatedAt = nowIso();
        await saveRun(this.policy, run);
        // If reviewer/security block, stop with manual message
        if (role === "reviewer" && artifacts.review?.verdict === "reject") {
            run.state = "FAILED";
            run.error = { code: "REVIEWER_REJECTED", message: "Reviewer rejected the patch" };
            run.updatedAt = nowIso();
            await saveRun(this.policy, run);
            return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: true, status: "failed", message: "Reviewer rejected" };
        }
        if (role === "security" && artifacts.security?.verdict === "block") {
            run.state = "FAILED";
            run.error = { code: "SECURITY_BLOCKED", message: "Security blocked the patch" };
            run.updatedAt = nowIso();
            await saveRun(this.policy, run);
            return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: true, status: "failed", message: "Security blocked" };
        }
        if (role === "security" && artifacts.security?.verdict === "manualConfirm") {
            run.state = "READY_TO_APPLY";
            run.updatedAt = nowIso();
            await saveRun(this.policy, run);
            return {
                runId: parsedIn.runId,
                jobId: parsedIn.jobId,
                ok: true,
                status: "manual",
                message: "Security requires manual confirmation before applying.",
                suggestedTools: ["pipeline.applyAndVerify", "workspace.applyPatch", "exec.run"],
            };
        }
        // Continue running
        return { runId: parsedIn.runId, jobId: parsedIn.jobId, ok: true, status: "running" };
    }
    // 12.3: merge tool (choose candidate, materialize patchCandidate + runOutput)
    async mergeDecision(input) {
        const parsedIn = AgentsMergeDecisionInputSchema.parse(input);
        const run = (await tryLoadRun(this.policy, parsedIn.runId));
        if (!run)
            return { runId: parsedIn.runId, ok: false, status: "failed", message: "Run not found" };
        const decision = MergeDecisionSchema.parse(parsedIn.decision);
        const artifacts = run.agents?.artifacts ?? {};
        const candidates = Array.isArray(artifacts.candidates) ? artifacts.candidates : [];
        const chosen = candidates.find((c) => c.candidateId === decision.chosenCandidateId);
        if (!chosen) {
            return { runId: parsedIn.runId, ok: false, status: "failed", message: "chosenCandidateId not found in candidates" };
        }
        artifacts.chosenCandidateId = decision.chosenCandidateId;
        artifacts.patchCandidate = chosen; // materialize
        run.runOutput = { patch: chosen.patch, commands: chosen.commands ?? [] };
        run.agents.artifacts = artifacts;
        run.updatedAt = nowIso();
        // mark merge job done if exists
        const jobs = run.agents?.jobs ?? [];
        const mergeJob = jobs.find((j) => j.jobId === "merge");
        if (mergeJob) {
            mergeJob.status = "done";
            mergeJob.finishedAt = nowIso();
        }
        run.agents.activeJobId = undefined;
        await saveRun(this.policy, run);
        return { runId: parsedIn.runId, ok: true, status: "running" };
    }
}
