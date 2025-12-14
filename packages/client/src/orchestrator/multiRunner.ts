import { z } from "zod";
import type { LLMAdapter } from "../llm/adapter.js";
import { extractLikelyJSON, parseJSONStrict } from "../llm/prompt/json.js";
import { McpToolClient } from "../mcp/client.js";
import { withRetries } from "../util/retry.js";

// Minimal local schemas mirroring server expectedSchema names (12.1)
const MultiPlanSchema = z.object({
  jobs: z.array(z.object({ jobId: z.string(), role: z.string(), goal: z.string() })).min(1),
  acceptanceCriteria: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
});
const PatchCandidateSchema = z.object({
  candidateId: z.string(),
  patch: z.string().min(1),
  commands: z.array(z.object({ cmd: z.string(), args: z.array(z.string()).optional() })).optional(),
  rationale: z.string().optional(),
});
const ReviewReportSchema = z.object({
  verdict: z.enum(["approve", "changes", "reject"]),
  summary: z.string().optional(),
  findings: z.array(z.object({ severity: z.string(), type: z.string(), message: z.string() })).optional(),
});
const SecurityReportSchema = z.object({
  verdict: z.enum(["allow", "block", "manualConfirm"]),
  summary: z.string().optional(),
  issues: z.array(z.object({ type: z.string(), message: z.string(), severity: z.string().optional() })).optional(),
});

// 12.1.1: Policy snapshot for client-side gating
const PolicySnapshotSchema = z.object({
  allowWrite: z.boolean().default(false),
  allowExec: z.boolean().default(false),
  allowGit: z.boolean().default(false),
  requireConfirmationFor: z.array(z.string()).default([]),
});
type PolicySnapshot = z.infer<typeof PolicySnapshotSchema>;

function whyBlocked(policy: PolicySnapshot, what: "applyPatch" | "exec" | "branch" | "commit"): string | null {
  const req = new Set(policy.requireConfirmationFor ?? []);
  if (req.has(what)) return `Blocked by confirmation gate: requireConfirmationFor includes ${what}`;
  if (what === "applyPatch" && !policy.allowWrite) return "Blocked: allowWrite=false";
  if (what === "exec" && !policy.allowExec) return "Blocked: allowExec=false";
  if ((what === "branch" || what === "commit") && !policy.allowGit) return "Blocked: allowGit=false";
  return null;
}

type AdapterMap =
  | LLMAdapter
  | {
      planner?: LLMAdapter;
      implementer?: LLMAdapter;
      reviewer?: LLMAdapter;
      security?: LLMAdapter;
    };

function pickAdapter(adapters: AdapterMap, role: string): LLMAdapter {
  if ("complete" in (adapters as LLMAdapter)) return adapters as LLMAdapter;
  const m = adapters as Record<string, LLMAdapter | undefined>;
  return (m[role] ?? m.planner ?? m.implementer ?? m.reviewer ?? m.security) as LLMAdapter;
}

// 12.3: merge decision schema
const MergeDecisionSchema = z.object({
  chosenCandidateId: z.string().min(1),
  rationale: z.string().optional(),
  requiredFixes: z.array(z.string()).optional(),
});

function schemaFor(expected: string) {
  if (expected === "multiPlan") return MultiPlanSchema;
  if (expected === "patchCandidate") return PatchCandidateSchema;
  if (expected === "reviewReport") return ReviewReportSchema;
  if (expected === "securityReport") return SecurityReportSchema;
  if (expected === "mergeDecision") return MergeDecisionSchema;
  throw new Error(`Unknown expectedSchema: ${expected}`);
}

export type MultiAgentsResult =
  | { status: "done"; runId: string }
  | { status: "failed"; runId: string; message?: string }
  | { status: "manual"; runId: string; message?: string; suggestedTools?: string[] }
  | { status: "applied"; runId: string; pipeline?: unknown; branch?: unknown; commit?: unknown; bundle?: unknown };

export async function runMultiAgentsSerial(opts: {
  mcp: { command: string; args: string[] };
  adapters: AdapterMap;
  task: { goal: string; context?: unknown };
  /** 12.6.2: reference a mode containing flow DSL */
  modeId?: string;
  flow?: {
    autoApply?: boolean;
    useReview?: boolean;
    useSecurity?: boolean;
    createBranch?: boolean;
    autoCommit?: boolean;
    bundlePR?: boolean;
    dryRun?: boolean;
    maxFixIterations?: number;
  };
  /** 12.1.1: If true, auto-apply when READY_TO_APPLY (requires policy snapshot) */
  autoApply?: boolean;
  /** 12.1.1: Policy snapshot for client-side gating */
  policy?: PolicySnapshot;
  onLog?: (msg: string) => void;
}): Promise<MultiAgentsResult> {
  const log = opts.onLog ?? (() => {});
  const mcp = new McpToolClient({ command: opts.mcp.command, args: opts.mcp.args });
  await mcp.start();
  try {
    // 12.6.2: forward modeId if provided
    const planInput: any = { task: opts.task, flow: opts.flow ?? {} };
    if (opts.modeId) planInput.modeId = opts.modeId;

    const planRes = await mcp.callToolJSON("agents.plan", planInput);
    const runId = planRes.runId as string;
    log(`agents.plan -> runId=${runId}${opts.modeId ? ` modeId=${opts.modeId}` : ""}`);

    while (true) {
      const next = await mcp.callToolJSON("agents.next", { runId });
      if (next.status === "done") return { status: "done", runId };
      if (next.status === "failed") return { status: "failed", runId, message: next.message as string | undefined };

      // 12.1.1: handle manual status with optional auto-apply
      if (next.status === "manual") {
        const isReady = String(next.message ?? "").toLowerCase().includes("ready to apply");
        const applyPayload = next.applyPayload as { patch: string; commands?: { cmd: string; args?: string[] }[] } | null;

        if (opts.autoApply && isReady && applyPayload?.patch) {
          const policy = PolicySnapshotSchema.parse(opts.policy ?? {});

          const w1 = whyBlocked(policy, "applyPatch");
          const w2 = whyBlocked(policy, "exec");
          if (w1 || w2) {
            return {
              status: "manual",
              runId,
              message: `Auto-apply blocked. ${w1 ?? ""}${w1 && w2 ? " | " : ""}${w2 ?? ""}`.trim(),
              suggestedTools: next.suggestedTools as string[] | undefined,
            };
          }

          // Apply + verify
          const dryRun = !!(opts.flow?.dryRun ?? false);
          const pipeline = await mcp.callToolJSON("pipeline.applyAndVerify", {
            runId,
            patch: applyPayload.patch,
            commands: applyPayload.commands ?? [],
            dryRun,
          });
          log(`pipeline.applyAndVerify -> ok=${pipeline.ok} runId=${pipeline.runId}`);

          // Optional git/bundle if requested in flow and allowed + not gated
          const flow = opts.flow ?? {};
          let branch: unknown = null;
          let commit: unknown = null;
          let bundle: unknown = null;

          if (flow.createBranch) {
            const wb = whyBlocked(policy, "branch");
            if (!wb) {
              const name = `mcp/${runId}`;
              branch = await mcp.callToolJSON("git.branch.create", { name });
              log(`git.branch.create -> ${name}`);
            } else {
              log(`git.branch.create skipped: ${wb}`);
            }
          }

          if (flow.autoCommit) {
            const wc = whyBlocked(policy, "commit");
            if (!wc) {
              commit = await mcp.callToolJSON("git.commit", { message: `mcp: apply changes for ${runId}` });
              log(`git.commit -> ok`);
            } else {
              log(`git.commit skipped: ${wc}`);
            }
          }

          if (flow.bundlePR && next.sessionId) {
            bundle = await mcp.callToolJSON("bundle.pr.create", { sessionId: next.sessionId as string });
            log(`bundle.pr.create -> sessionId=${next.sessionId}`);
          }

          return { status: "applied", runId, pipeline, branch, commit, bundle };
        }

        return { status: "manual", runId, message: next.message as string | undefined, suggestedTools: next.suggestedTools as string[] | undefined };
      }

      const job = next.job as { jobId: string; role: string } | null;
      const expected = next.expectedSchema as string | null;
      const promptPack = next.promptPack as { system: string; user: string } | null;
      if (!job || !expected || !promptPack) return { status: "failed", runId, message: "Invalid agents.next response" };

      const adapter = pickAdapter(opts.adapters, job.role);
      const schema = schemaFor(expected);
      log(`job ${job.jobId} (${job.role}) expected=${expected}`);

      const payload = await withRetries(
        async () => {
          const text = await adapter.complete({
            messages: [
              { role: "system", content: promptPack.system },
              { role: "user", content: promptPack.user },
            ],
          });

          const maybe = extractLikelyJSON(text);
          const parsed = parseJSONStrict(maybe);
          return schema.parse(parsed);
        },
        { retries: 2, onRetry: (e, n) => log(`retry ${n}: ${String((e as Error)?.message ?? e)}`) }
      );

      // 12.3: merge job uses agents.mergeDecision tool
      let submit: Record<string, unknown>;
      if (expected === "mergeDecision") {
        submit = await mcp.callToolJSON("agents.mergeDecision", { runId, decision: payload });
        if (submit.status === "failed") return { status: "failed", runId, message: submit.message as string | undefined };
      } else {
        submit = await mcp.callToolJSON("agents.submit", { runId, jobId: job.jobId, role: job.role, payload });
        if (submit.status === "failed") return { status: "failed", runId, message: submit.message as string | undefined };
        if (submit.status === "manual")
          return { status: "manual", runId, message: submit.message as string | undefined, suggestedTools: submit.suggestedTools as string[] | undefined };
      }
    }
  } finally {
    await mcp.stop();
  }
}
