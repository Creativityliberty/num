import type { PlanResult, TaskEnvelope, UniversalMode } from "./schemas.js";

function id(prefix: string, n: number): string {
  return `${prefix}-${n}`;
}

function includesAny(hay: string, needles: string[]): boolean {
  const h = hay.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function stackHints(task: TaskEnvelope): string[] {
  const stack = task.context?.techStack ?? [];
  const files = task.context?.openFiles ?? [];
  const hints = new Set<string>();
  for (const s of stack) hints.add(s.toLowerCase());
  for (const f of files) {
    const ext = (f.split(".").pop() ?? "").toLowerCase();
    if (ext === "ts") hints.add("typescript");
    if (ext === "js") hints.add("javascript");
    if (ext === "py") hints.add("python");
    if (ext === "go") hints.add("go");
  }
  return Array.from(hints);
}

function defaultVerification(hints: string[]): string[] {
  const v: string[] = ["Review changes for scope + safety."];
  if (hints.includes("typescript") || hints.includes("javascript") || hints.includes("node")) {
    v.push("Run: npm test (or project test command).");
    v.push("Run: npm run lint (if available).");
    v.push("Run: npm run typecheck (if available).");
  }
  if (hints.includes("python")) {
    v.push("Run: pytest (or project test command).");
    v.push("Run: ruff/flake8 + mypy (if used).");
  }
  v.push("Ensure no new warnings/errors in CI-equivalent checks.");
  return v;
}

export function buildDeterministicPlan(opts: {
  sessionId: string;
  task: TaskEnvelope;
  mode?: UniversalMode;
  style: "plan" | "checklist";
  depth: 1 | 2 | 3;
  selectedModeMeta?: { id: string; name: string; confidence?: number };
}): PlanResult {
  const { task, style, depth, mode } = opts;
  const goal = task.goal.trim();
  const errs = task.context?.errors ?? "";
  const diff = task.context?.diff ?? "";

  const hints = stackHints(task);

  const phases: PlanResult["phases"] = [];
  const acceptanceCriteria: string[] = [];
  const verification: string[] = [];
  const risks: string[] = [];
  const assumptions: string[] = [];

  // Phase 1: Understand
  {
    const steps = [
      {
        id: id("understand", 1),
        action: "Restate the goal and define scope boundaries.",
        details: `Goal: ${goal}`,
        expectedOutput: "Short scope statement + non-goals.",
      },
    ];
    if (task.context?.openFiles?.length) {
      steps.push({
        id: id("understand", 2),
        action: "Review relevant files and identify key modules/components involved.",
        details: `Open files: ${task.context.openFiles.join(", ")}`,
        expectedOutput: "List of affected modules + why they matter.",
      });
    }
    phases.push({ title: "Understand & Scope", steps });
  }

  // Phase 2: Diagnose / Design
  if (errs || includesAny(goal, ["fix", "bug", "error", "exception", "failing", "fails", "crash"])) {
    const steps = [
      {
        id: id("diagnose", 1),
        action: "Reproduce the problem and capture the minimal failing signal.",
        details: errs ? `Errors:\n${errs}` : "Use existing failing tests/logs/steps to reproduce.",
        expectedOutput: "A reproducible failing case (test or steps) + notes.",
      },
      {
        id: id("diagnose", 2),
        action: "Identify root cause and the smallest safe fix.",
        expectedOutput: "Root cause summary + fix strategy.",
      },
    ];
    if (depth >= 2) {
      steps.push({
        id: id("diagnose", 3),
        action: "Decide whether a regression test is needed and where it belongs.",
        expectedOutput: "Test plan (unit/integration/e2e) and target location.",
      });
    }
    phases.push({ title: "Diagnose", steps });
  } else {
    const steps = [
      {
        id: id("design", 1),
        action: "Draft an implementation approach (data flow, APIs, modules).",
        expectedOutput: "High-level design notes + file touch list.",
      },
    ];
    if (depth >= 2) {
      steps.push({
        id: id("design", 2),
        action: "Identify edge cases, error handling, and backward compatibility concerns.",
        expectedOutput: "Edge-case list + handling strategy.",
      });
    }
    phases.push({ title: "Design", steps });
  }

  // Phase 3: Implement
  {
    const steps = [
      {
        id: id("implement", 1),
        action: "Implement the change with minimal surface area.",
        details: mode ? `Mode guidance: ${mode.name} (${mode.id})` : undefined,
        expectedOutput: "Code changes localized and readable.",
      },
    ];
    if (depth >= 2) {
      steps.push({
        id: id("implement", 2),
        action: "Add/update tests relevant to the change.",
        details: undefined,
        expectedOutput: "Tests that fail before and pass after.",
      });
    }
    if (diff) {
      steps.push({
        id: id("implement", 3),
        action: "Review the provided diff context and align implementation accordingly.",
        details: undefined,
        expectedOutput: "Implementation consistent with diff constraints.",
      });
    }
    phases.push({ title: "Implement", steps });
  }

  // Phase 4: Verify
  verification.push(...defaultVerification(hints));
  phases.push({
    title: "Verify",
    steps: [
      {
        id: id("verify", 1),
        action: "Run verification commands and confirm the fix/feature meets acceptance criteria.",
        expectedOutput: "Green checks + summary of results.",
      },
    ],
  });

  // Acceptance criteria (generic but useful)
  acceptanceCriteria.push("The change meets the stated goal without breaking existing behavior.");
  if (errs) acceptanceCriteria.push("The previously failing signal no longer reproduces.");
  acceptanceCriteria.push("Relevant tests are added/updated and pass.");

  // Risks/Assumptions
  assumptions.push("Project test/lint commands are available or can be inferred from package/tooling.");
  if (!task.context?.openFiles?.length) assumptions.push("Relevant files will be identified during implementation.");
  risks.push("Hidden coupling may require adjusting related modules beyond the initially identified scope.");
  if (includesAny(goal, ["refactor", "cleanup"])) risks.push("Refactors can introduce subtle behavior changes—prefer small steps.");

  return {
    sessionId: opts.sessionId,
    selectedMode: opts.selectedModeMeta,
    style,
    phases,
    acceptanceCriteria,
    verification,
    risks,
    assumptions,
  };
}
