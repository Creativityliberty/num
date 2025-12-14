export type ToolTextResponse = {
  content: Array<{ type: "text"; text: string }>;
};

export type OrchestrateRunResponse = {
  sessionId: string;
  runId: string;
  state: string;
  selectedMode?: { id: string; name: string; confidence?: number };
  nextStep:
    | {
        kind: "llm";
        stepId: "plan" | "run" | "review";
        tool: string;
        promptPack: unknown;
        expected: "PlanJSON" | "RunJSON" | "ReviewJSON";
      }
    | { kind: "manual"; message: string; suggestedTools?: string[] }
    | { kind: "done"; message: string };
  bundlePath?: string;
  git?: { branch?: string; commitSha?: string } | null;
  error?: { code: string; message: string };
};

export type OrchestrateContinueResponse = OrchestrateRunResponse;

export type OrchestrateStatusResponse = {
  runId: string;
  sessionId: string;
  state: string;
  selectedMode: { id: string; name: string; confidence?: number } | null;
  bundlePath: string | null;
  git: { branch?: string; commitSha?: string } | null;
  fixIterations: number;
  updatedAt: string;
};
