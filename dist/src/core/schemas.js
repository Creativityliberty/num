import { z } from "zod";
// 19.3: Model telemetry schemas
export const ModelRefSchema = z.object({
    provider: z.string(),
    model: z.string(),
});
export const ModelAttemptSchema = z.object({
    model: ModelRefSchema,
    ok: z.boolean(),
    reason: z.string().optional(),
    transient: z.boolean().optional(),
});
export const ModelUsageSchema = z.object({
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
    costUsd: z.number().optional(),
});
export const ModelTelemetryEventSchema = z.object({
    ts: z.string(),
    runId: z.string(),
    stepId: z.string().optional(),
    jobId: z.string().optional(),
    role: z.string().optional(),
    chosenModel: ModelRefSchema.optional(),
    attempts: z.array(ModelAttemptSchema).default([]),
    usage: ModelUsageSchema.optional(),
});
export const RawModeSchema = z.record(z.unknown());
export const UniversalModeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    categoryPath: z.array(z.string()).optional(),
    prompts: z.object({
        system: z.string().optional(),
        developer: z.string().optional(),
    }),
    source: z.object({
        path: z.string(),
        raw: z.unknown(),
    }),
});
export const ModesListInputSchema = z.object({
    query: z.string().optional().describe("Full-text query (id/name/description/tags)"),
    tag: z.string().optional().describe("Filter by tag"),
    category: z.string().optional().describe("Filter by category (first segment)"),
});
export const ModesGetInputSchema = z.object({
    id: z.string().min(1).describe("Mode id (slug)"),
});
export const SessionSchema = z.object({
    sessionId: z.string().optional().describe("Correlation id for a run/session"),
});
export const TaskEnvelopeSchema = z.object({
    goal: z.string().min(1).describe("What the user wants to achieve"),
    context: z
        .object({
        repoName: z.string().optional(),
        openFiles: z.array(z.string()).optional(),
        errors: z.string().optional().describe("Stacktrace / error messages"),
        diff: z.string().optional().describe("Git diff or patch context"),
        techStack: z.array(z.string()).optional().describe("e.g. ['node','typescript','python']"),
    })
        .optional(),
    constraints: z
        .object({
        qualityBar: z.enum(["draft", "normal", "high"]).optional(),
        timeBudget: z.string().optional(),
    })
        .optional(),
    permissions: z
        .object({
        readFs: z.boolean().optional(),
        writeFs: z.boolean().optional(),
        runCommands: z.array(z.string()).optional(),
        git: z.boolean().optional(),
        network: z.boolean().optional(),
    })
        .optional(),
    modelPreference: z
        .object({
        provider: z.string().optional().describe("openai|anthropic|local|..."),
        model: z.string().optional(),
    })
        .optional(),
});
export const ModesSuggestInputSchema = z.object({
    sessionId: z.string().optional(),
    task: TaskEnvelopeSchema,
    topK: z.number().int().min(1).max(20).optional().default(5),
});
export const ModesRenderInputSchema = z.object({
    sessionId: z.string().optional(),
    id: z.string().min(1),
    task: TaskEnvelopeSchema,
    outputFormat: z.enum(["auto", "plan", "patch", "checklist"]).optional().default("auto"),
});
export const ModesPlanInputSchema = z.object({
    sessionId: z.string().optional(),
    modeId: z.string().optional(),
    task: TaskEnvelopeSchema,
    style: z.enum(["plan", "checklist"]).optional().default("plan"),
    depth: z.number().int().min(1).max(3).optional().default(2),
});
export const PlanPhaseSchema = z.object({
    title: z.string(),
    steps: z.array(z.object({
        id: z.string(),
        action: z.string(),
        details: z.string().optional(),
        expectedOutput: z.string().optional(),
    })),
});
export const PlanResultSchema = z.object({
    sessionId: z.string(),
    selectedMode: z
        .object({
        id: z.string(),
        name: z.string(),
        confidence: z.number().min(0).max(1).optional(),
    })
        .optional(),
    style: z.enum(["plan", "checklist"]),
    phases: z.array(PlanPhaseSchema),
    acceptanceCriteria: z.array(z.string()),
    verification: z.array(z.string()),
    risks: z.array(z.string()),
    assumptions: z.array(z.string()),
});
export const ModesPlanPromptInputSchema = z.object({
    sessionId: z.string().optional(),
    modeId: z.string().optional(),
    task: TaskEnvelopeSchema,
    style: z.enum(["plan", "checklist"]).optional().default("plan"),
    depth: z.number().int().min(1).max(3).optional().default(2),
});
// ============ ÉTAPE 6 — RUN / REVIEW / APPLY / EXEC ============
export const ModesRunPromptInputSchema = z.object({
    sessionId: z.string().optional(),
    modeId: z.string().optional(),
    task: TaskEnvelopeSchema,
});
export const ModesReviewPromptInputSchema = z.object({
    sessionId: z.string().optional(),
    modeId: z.string(),
    patch: z.string().min(1).describe("Unified diff to review"),
});
export const WorkspaceApplyPatchInputSchema = z.object({
    sessionId: z.string(),
    diff: z.string().min(1).describe("Unified diff to apply"),
    workspaceRoot: z.string().min(1).describe("Absolute path to workspace root"),
    dryRun: z.boolean().optional().default(false),
});
export const ExecRunInputSchema = z.object({
    sessionId: z.string(),
    cmd: z.string().min(1).describe("Executable name (no path, no whitespace)"),
    args: z.array(z.string()).optional().default([]).describe("Arguments array"),
    cwd: z.string().optional().describe("Working directory (relative to workspace root)"),
    timeoutMs: z.number().int().min(1000).max(120000).optional().default(60000),
});
export const ExecRunInputSchemaLegacy = z.object({
    sessionId: z.string(),
    command: z.string().min(1).describe("Command to execute (legacy, deprecated)"),
    cwd: z.string().optional().describe("Working directory (defaults to workspace root)"),
    timeoutMs: z.number().int().min(1000).max(120000).optional().default(60000),
});
// Output schemas (for documentation / validation)
export const RunBundleOutputSchema = z.object({
    patch: z.string().describe("Unified diff"),
    commands: z.array(z.string()).describe("Commands to run for verification"),
    pr: z.object({
        title: z.string(),
        body: z.string(),
    }),
    notes: z.object({
        assumptions: z.array(z.string()),
        risks: z.array(z.string()),
        rollback: z.string(),
    }),
});
export const ReviewOutputSchema = z.object({
    severity: z.enum(["low", "medium", "high", "blocker"]),
    findings: z.array(z.object({
        type: z.enum(["bug", "test", "security", "style", "perf", "docs"]),
        message: z.string(),
        location: z.string().optional(),
    })),
    recommendedCommands: z.array(z.string()),
    approval: z.boolean(),
});
export const ApplyPatchResultSchema = z.object({
    applied: z.boolean(),
    dryRun: z.boolean(),
    filesChanged: z.number(),
    insertions: z.number(),
    deletions: z.number(),
    errors: z.array(z.string()),
});
export const ExecResultSchema = z.object({
    exitCode: z.number(),
    stdout: z.string(),
    stderr: z.string(),
    durationMs: z.number(),
    truncated: z.boolean(),
    command: z.string(),
});
// ============ ÉTAPE 7 — Git / Pipeline / Bundle schemas ============
export const GitStatusInputSchema = z.object({
    sessionId: z.string().optional(),
});
export const GitDiffInputSchema = z.object({
    sessionId: z.string().optional(),
    staged: z.boolean().optional().default(false),
    paths: z.array(z.string()).optional(),
});
export const GitLogInputSchema = z.object({
    sessionId: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional().default(10),
});
export const GitBranchCreateInputSchema = z.object({
    sessionId: z.string().optional(),
    name: z.string().min(3).max(80),
});
export const GitCommitInputSchema = z.object({
    sessionId: z.string().optional(),
    message: z.string().min(1),
    addAll: z.boolean().optional().default(true),
    dryRun: z.boolean().optional().default(false),
});
export const PipelineApplyAndVerifyInputSchema = z.object({
    sessionId: z.string().optional(),
    diff: z.string().min(1),
    commands: z.array(z.string()).default([]),
    dryRun: z.boolean().optional().default(false),
    timeoutMs: z.number().int().min(1000).max(120000).optional().default(60000),
});
export const BundlePrCreateInputSchema = z.object({
    sessionId: z.string().optional(),
    modeId: z.string().optional(),
    task: TaskEnvelopeSchema.optional(),
    plan: z.unknown().optional(),
    runOutput: z.unknown().optional(),
    reviewOutput: z.unknown().optional(),
    execResults: z.unknown().optional(),
    git: z
        .object({
        branch: z.string().optional(),
        commitSha: z.string().optional(),
    })
        .optional(),
    writeFile: z.boolean().optional().default(true),
});
// ============ ÉTAPE 8 — Orchestrator schemas ============
export const OrchestrateFlowSchema = z.object({
    usePlanPrompt: z.boolean().optional().default(true),
    useReview: z.boolean().optional().default(true),
    autoApply: z.boolean().optional().default(false),
    autoCommit: z.boolean().optional().default(false),
    createBranch: z.boolean().optional().default(false),
    branchName: z.string().optional(),
    commitMessage: z.string().optional(),
    dryRun: z.boolean().optional().default(false),
    maxFixIterations: z.number().int().min(0).max(5).optional().default(2),
});
export const OrchestrateRunInputSchema = z.object({
    sessionId: z.string().optional(),
    task: TaskEnvelopeSchema,
    modeId: z.string().optional(),
    flow: OrchestrateFlowSchema.optional().default({}),
});
export const OrchestrateContinueInputSchema = z.object({
    runId: z.string().min(8),
    sessionId: z.string().optional(),
    stepId: z.enum(["plan", "run", "review"]),
    payload: z.unknown(),
});
export const OrchestrateStatusInputSchema = z.object({
    runId: z.string().min(8),
});
export const OrchestrateCancelInputSchema = z.object({
    runId: z.string().min(8),
});
export const PlanPayloadSchema = z.object({
    phases: z.array(z.object({ title: z.string(), steps: z.array(z.any()) })).min(1),
    acceptanceCriteria: z.array(z.string()).optional().default([]),
    verification: z.array(z.string()).optional().default([]),
    risks: z.array(z.string()).optional().default([]),
    assumptions: z.array(z.string()).optional().default([]),
});
export const RunOutputPayloadSchema = z.object({
    patch: z.string().min(1),
    commands: z.array(z.string()).optional().default([]),
    pr: z.object({ title: z.string().optional(), body: z.string().optional() }).optional(),
    notes: z
        .object({
        assumptions: z.array(z.string()).optional(),
        risks: z.array(z.string()).optional(),
        rollback: z.string().optional(),
    })
        .optional(),
});
export const ReviewOutputPayloadSchema = z.object({
    severity: z.enum(["low", "medium", "high", "blocker"]),
    findings: z.array(z.object({ type: z.string(), message: z.string(), location: z.string().optional() })).optional().default([]),
    recommendedCommands: z.array(z.string()).optional().default([]),
    approval: z.boolean(),
});
export const OrchestrateStateSchema = z.enum([
    "INIT",
    "MODE_SELECTED",
    "NEEDS_PLAN",
    "NEEDS_PATCH",
    "NEEDS_REVIEW",
    "READY_TO_APPLY",
    "APPLIED_AND_VERIFIED",
    "BRANCHED",
    "COMMITTED",
    "BUNDLED",
    "DONE",
    "FAILED",
    "CANCELLED",
]);
export const RollbackRecordSchema = z.object({
    ts: z.string(),
    kind: z.enum(["manual", "auto"]),
    ok: z.boolean(),
    runId: z.string(),
    restoredCount: z.number().int().nonnegative().optional(),
    restored: z.array(z.string()).optional(),
    message: z.string().optional(),
});
export const OrchestrateRunRecordSchema = z.object({
    runId: z.string(),
    sessionId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    state: OrchestrateStateSchema,
    task: TaskEnvelopeSchema,
    flow: OrchestrateFlowSchema,
    selectedMode: z
        .object({
        id: z.string(),
        name: z.string(),
        confidence: z.number().min(0).max(1).optional(),
    })
        .optional(),
    plan: z.unknown().optional(),
    runOutput: z.unknown().optional(),
    reviewOutput: z.unknown().optional(),
    pipeline: z.unknown().optional(),
    git: z.object({ branch: z.string().optional(), commitSha: z.string().optional() }).optional(),
    bundlePath: z.string().optional(),
    fixIterations: z.number().int().min(0).default(0),
    history: z.array(z.object({ ts: z.string(), from: OrchestrateStateSchema, to: OrchestrateStateSchema, note: z.string().optional() })).default([]),
    error: z.object({ code: z.string(), message: z.string() }).optional(),
    rollback: RollbackRecordSchema.optional(),
    agents: z.lazy(() => AgentsStateSchema).optional(),
    // 19.3: model telemetry
    telemetry: z.array(ModelTelemetryEventSchema).optional(),
});
// =========================
// Step 12.1 — Multi-agents (Serial)
// =========================
// 12.3: adds "arbiter" for merge decisions
export const AgentRoleSchema = z.enum(["planner", "implementer", "reviewer", "security", "arbiter"]);
export const JobStatusSchema = z.enum(["pending", "running", "done", "failed"]);
export const AgentSpecSchema = z.object({
    id: z.string().min(1),
    role: AgentRoleSchema,
    modelHint: z.string().optional(),
});
export const JobSchema = z.object({
    jobId: z.string().min(1),
    role: AgentRoleSchema,
    goal: z.string().min(1),
    dependsOn: z.array(z.string()).default([]),
    status: JobStatusSchema.default("pending"),
    startedAt: z.string().optional(),
    finishedAt: z.string().optional(),
});
export const MultiPlanSchema = z.object({
    jobs: z.array(JobSchema).min(1),
    acceptanceCriteria: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
});
export const PatchCandidateSchema = z.object({
    candidateId: z.string().min(1),
    patch: z.string().min(1),
    commands: z
        .array(z.object({ cmd: z.string().min(1), args: z.array(z.string()).default([]) }))
        .default([]),
    rationale: z.string().optional(),
});
// 12.1.1: payload for auto-apply
export const ApplyPayloadSchema = z.object({
    patch: z.string().min(1),
    commands: z
        .array(z.object({ cmd: z.string().min(1), args: z.array(z.string()).default([]) }))
        .default([]),
});
// 12.3: merge decision for consensus implement
export const MergeDecisionSchema = z.object({
    chosenCandidateId: z.string().min(1),
    rationale: z.string().optional(),
    requiredFixes: z.array(z.string()).default([]),
});
export const ReviewFindingSchema = z.object({
    severity: z.enum(["info", "low", "medium", "high", "critical"]).default("info"),
    type: z.string().min(1),
    message: z.string().min(1),
    files: z.array(z.string()).optional(),
});
export const ReviewReportSchema = z.object({
    verdict: z.enum(["approve", "changes", "reject"]),
    summary: z.string().optional(),
    findings: z.array(ReviewFindingSchema).default([]),
});
export const SecurityIssueSchema = z.object({
    type: z.string().min(1),
    message: z.string().min(1),
    severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
});
export const SecurityReportSchema = z.object({
    verdict: z.enum(["allow", "block", "manualConfirm"]),
    summary: z.string().optional(),
    issues: z.array(SecurityIssueSchema).default([]),
});
export const AgentsArtifactsSchema = z.object({
    multiPlan: MultiPlanSchema.optional(),
    // 12.3: store multiple candidates from parallel implementers
    candidates: z.array(PatchCandidateSchema).default([]),
    chosenCandidateId: z.string().optional(),
    patchCandidate: PatchCandidateSchema.optional(), // chosen (materialized for downstream)
    review: ReviewReportSchema.optional(),
    security: SecurityReportSchema.optional(),
    // 12.6: store flow spec and per-node outputs
    flow: z.lazy(() => FlowSpecSchema).optional(),
    byNode: z.record(z.any()).default({}),
});
export const AgentsStateSchema = z.object({
    jobs: z.array(JobSchema).default([]),
    artifacts: AgentsArtifactsSchema.default({}),
    activeJobId: z.string().optional(),
    fixIterations: z.number().int().min(0).default(0),
    parallelReview: z.boolean().default(false),
    consensusImplement: z.boolean().default(false),
});
// 13.1: AgentRuntimePolicy for per-node model/budget/rateLimit
export const AgentRuntimePolicySchema = z.object({
    model: z.object({
        preferred: z.object({ provider: z.enum(["openai", "anthropic", "generic"]), model: z.string().min(1) }).optional(),
        fallbacks: z.array(z.object({ provider: z.enum(["openai", "anthropic", "generic"]), model: z.string().min(1) })).optional(),
    }).optional(),
    budget: z.object({
        maxTokens: z.number().int().positive().optional(),
        maxCostUsd: z.number().positive().optional(),
    }).optional(),
    rateLimit: z.object({
        rpm: z.number().int().positive().optional(),
        tpm: z.number().int().positive().optional(),
    }).optional(),
});
// 12.6: Flow DSL (PocketFlow-like)
export const FlowNodeSchema = z.object({
    id: z.string().min(1),
    role: AgentRoleSchema,
    goal: z.string().min(1),
    expectedSchema: z.enum(["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]),
    prompt: z.object({
        system: z.string().min(1),
        user: z.string().min(1),
    }),
    outputKey: z.string().optional(),
    // 13.1.1: per-node runtime policy overrides
    runtimePolicy: AgentRuntimePolicySchema.optional(),
});
export const FlowEdgeSchema = z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    kind: z.literal("dependsOn").default("dependsOn"),
});
export const FlowSpecSchema = z.object({
    version: z.literal("1").default("1"),
    name: z.string().optional(),
    nodes: z.array(FlowNodeSchema).min(1),
    edges: z.array(FlowEdgeSchema).default([]),
});
export const AgentsPlanInputSchema = z.object({
    task: z.object({
        goal: z.string().min(1),
        context: z.any().optional(),
    }),
    flow: z
        .object({
        autoApply: z.boolean().default(false),
        useReview: z.boolean().default(true),
        useSecurity: z.boolean().default(true),
        createBranch: z.boolean().default(false),
        autoCommit: z.boolean().default(false),
        dryRun: z.boolean().default(false),
        maxFixIterations: z.number().int().min(0).max(10).default(2),
        parallelReview: z.boolean().optional(),
        consensusImplement: z.boolean().optional(),
    })
        .default({}),
    // 12.6: optional flow DSL
    dsl: FlowSpecSchema.optional(),
    // 12.6.1: alternatively reference a mode containing flow DSL
    modeId: z.string().min(1).optional(),
});
export const AgentsNextInputSchema = z.object({
    runId: z.string().min(1),
});
export const AgentsSubmitInputSchema = z.object({
    runId: z.string().min(1),
    jobId: z.string().min(1),
    role: AgentRoleSchema,
    payload: z.any(),
});
// 12.3: merge decision input/output
export const AgentsMergeDecisionInputSchema = z.object({
    runId: z.string().min(1),
    decision: MergeDecisionSchema,
});
export const AgentsMergeDecisionResultSchema = z.object({
    runId: z.string(),
    ok: z.boolean(),
    status: z.enum(["running", "manual", "done", "failed"]).default("running"),
    message: z.string().optional(),
});
export const AgentsNextResultSchema = z.object({
    runId: z.string(),
    sessionId: z.string().optional(),
    job: JobSchema.nullable(),
    // 12.3: adds mergeDecision
    expectedSchema: z.enum(["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]).nullable(),
    promptPack: z
        .object({
        system: z.string().min(1),
        user: z.string().min(1),
    })
        .nullable(),
    applyPayload: ApplyPayloadSchema.nullable().optional(),
    // 12.6: identify which flow node produced this prompt
    nodeId: z.string().nullable().optional(),
    // 13.1: resolved runtime policy (model/budget/rateLimit)
    runtimePolicy: AgentRuntimePolicySchema.optional(),
    status: z.enum(["running", "manual", "done", "failed"]).default("running"),
    message: z.string().optional(),
    suggestedTools: z.array(z.string()).default([]),
});
export const AgentsSubmitResultSchema = z.object({
    runId: z.string(),
    jobId: z.string(),
    ok: z.boolean(),
    status: z.enum(["running", "manual", "done", "failed"]).default("running"),
    message: z.string().optional(),
    suggestedTools: z.array(z.string()).default([]),
});
