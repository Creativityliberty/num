import { runOrchestration, AnthropicAdapter } from "../src/index.js";

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY");

  const adapter = new AnthropicAdapter({ apiKey, model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20240620" });

  const res = await runOrchestration({
    mcp: {
      command: "node",
      args: ["dist/cli.js", "serve", "--modes-path", "./custom_modes.d", "--policy", "./policy.example.json"],
    },
    adapter,
    task: { goal: "Refactor utils module", context: { techStack: ["node", "typescript"] } },
    flow: { usePlanPrompt: true, useReview: true, autoApply: false },
    onLog: (m) => console.error(`[client] ${m}`),
  });

  console.log(res);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
