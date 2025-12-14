import { runOrchestration, OpenAIAdapter } from "../src/index.js";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const adapter = new OpenAIAdapter({ apiKey, model: process.env.OPENAI_MODEL ?? "gpt-4.1" });

  const res = await runOrchestration({
    mcp: {
      command: "node",
      args: ["dist/cli.js", "serve", "--modes-path", "./custom_modes.d", "--policy", "./policy.example.json"],
    },
    adapter,
    task: { goal: "Fix failing test in foo", context: { errors: "AssertionError: ...", techStack: ["node", "typescript"] } },
    flow: { usePlanPrompt: true, useReview: true, autoApply: false },
    onLog: (m) => console.error(`[client] ${m}`),
  });

  console.log(res);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
