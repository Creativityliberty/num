import type { TaskEnvelope, UniversalMode } from "./schemas.js";

export type RunPromptPack = {
  system: string;
  developer: string;
  task: TaskEnvelope;
  outputContract: string;
};

export type ReviewPromptPack = {
  system: string;
  developer: string;
  patchToReview: string;
  outputContract: string;
};

export function buildRunPrompt(mode: UniversalMode, task: TaskEnvelope): RunPromptPack {
  const outputContract = `{
  "patch": "unified diff (diff --git ...)",
  "commands": ["npm test", "npm run lint"],
  "pr": { "title": "...", "body": "..." },
  "notes": {
    "assumptions": ["..."],
    "risks": ["..."],
    "rollback": "git revert or manual steps"
  }
}`;

  const system = mode.prompts.system ?? `You are acting as ${mode.name} (${mode.id}).`;

  const developer = [
    mode.prompts.developer ?? "",
    "",
    "=== IMPLEMENTATION MODE (STRICT) ===",
    "",
    "You MUST return a JSON object with EXACTLY this shape:",
    outputContract,
    "",
    "RULES:",
    "- Do NOT explain the code outside of the JSON",
    "- Do NOT write files directly — only produce the patch",
    "- The patch MUST be a valid unified diff (diff --git format)",
    "- Include ALL necessary changes in a single patch",
    "- commands should be verification commands (tests, lint, typecheck)",
    "- pr.title should be concise (<72 chars)",
    "- pr.body should explain what/why/how",
    "- notes.rollback should explain how to undo if needed",
    "",
    "=== TASK ===",
    `Goal: ${task.goal}`,
    task.context?.repoName ? `Repo: ${task.context.repoName}` : "",
    task.context?.techStack?.length ? `Tech stack: ${task.context.techStack.join(", ")}` : "",
    task.context?.openFiles?.length ? `Open files: ${task.context.openFiles.join(", ")}` : "",
    task.context?.errors ? `Errors:\n${task.context.errors}` : "",
    task.context?.diff ? `Existing diff context:\n${task.context.diff}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    developer,
    task,
    outputContract,
  };
}

export function buildReviewPrompt(mode: UniversalMode, patch: string): ReviewPromptPack {
  const outputContract = `{
  "severity": "low|medium|high|blocker",
  "findings": [
    { "type": "bug|test|security|style|perf|docs", "message": "...", "location": "file:line?" }
  ],
  "recommendedCommands": ["npm test"],
  "approval": true|false
}`;

  const system = `You are a senior code reviewer operating as ${mode.name} (${mode.id}).`;

  const developer = [
    "=== REVIEW MODE (STRICT) ===",
    "",
    "You MUST return a JSON object with EXACTLY this shape:",
    outputContract,
    "",
    "RULES:",
    "- Review the patch for bugs, security issues, test coverage, style, performance, and documentation",
    "- severity: 'blocker' if the patch should NOT be merged as-is",
    "- approval: true only if the patch is safe to merge",
    "- findings: list ALL issues found, even minor ones",
    "- recommendedCommands: commands to run for verification",
    "- Do NOT suggest code changes — only identify issues",
    "",
    "=== PATCH TO REVIEW ===",
    patch,
  ].join("\n");

  return {
    system,
    developer,
    patchToReview: patch,
    outputContract,
  };
}
