import type { ModesRenderInput, TaskEnvelope, UniversalMode } from "./schemas.js";

function pickOutputFormat(input: ModesRenderInput, task: TaskEnvelope): "plan" | "patch" | "checklist" {
  if (input.outputFormat !== "auto") return input.outputFormat;

  const goal = task.goal.toLowerCase();
  if (goal.includes("plan") || goal.includes("roadmap") || goal.includes("étapes")) return "plan";
  if (goal.includes("checklist")) return "checklist";
  return "patch";
}

export type PromptPack = {
  mode: { id: string; name: string; description?: string; tags: string[]; categoryPath?: string[] };
  system: string;
  developer: string;
  task: TaskEnvelope;
  output: {
    format: "plan" | "patch" | "checklist";
    instructions: string;
  };
  policies: {
    // v1 simple: on passe les permissions et on ajoute règles d'autonomie minimales
    permissions?: TaskEnvelope["permissions"];
    notes: string[];
  };
};

export function renderPromptPack(mode: UniversalMode, input: ModesRenderInput): PromptPack {
  const format = pickOutputFormat(input, input.task);

  const baseSystem =
    mode.prompts.system?.trim() ??
    `You are operating in the mode "${mode.name}" (id: ${mode.id}).`;

  const baseDeveloper =
    mode.prompts.developer?.trim() ??
    mode.description?.trim() ??
    "Follow best engineering practices. Be explicit about assumptions and risks.";

  const outputInstructions =
    format === "patch"
      ? [
          "Return changes as a unified diff patch when possible.",
          "If you cannot produce a patch, return a step-by-step plan and the exact files/sections to edit.",
          "Include tests when relevant.",
        ].join("\n")
      : format === "plan"
      ? [
          "Return a step-by-step plan with clear checkpoints.",
          "Include acceptance criteria and validation steps (tests/commands).",
        ].join("\n")
      : [
          "Return a checklist grouped by phases (analysis, implementation, verification).",
          "Each item must be actionable and verifiable.",
        ].join("\n");

  const developer = [
    baseDeveloper,
    "",
    "=== TASK CONTEXT (from IDE/client) ===",
    `Goal: ${input.task.goal}`,
    input.task.context?.repoName ? `Repo: ${input.task.context.repoName}` : "",
    input.task.context?.techStack?.length ? `Tech stack: ${input.task.context.techStack.join(", ")}` : "",
    input.task.context?.openFiles?.length ? `Open files: ${input.task.context.openFiles.join(", ")}` : "",
    input.task.context?.errors ? `Errors:\n${input.task.context.errors}` : "",
    input.task.context?.diff ? `Diff:\n${input.task.context.diff}` : "",
    "",
    "=== OUTPUT REQUIREMENTS ===",
    outputInstructions,
  ]
    .filter(Boolean)
    .join("\n");

  const policyNotes: string[] = [
    "Respect the provided permissions. If an action is not permitted, ask before proceeding.",
    "Prefer small, safe edits with verification steps.",
  ];

  return {
    mode: {
      id: mode.id,
      name: mode.name,
      description: mode.description,
      tags: mode.tags,
      categoryPath: mode.categoryPath,
    },
    system: baseSystem,
    developer,
    task: input.task,
    output: { format, instructions: outputInstructions },
    policies: { permissions: input.task.permissions, notes: policyNotes },
  };
}
