import { runOrchestration, GenericAdapter } from "../src/index.js";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  const adapter = new GenericAdapter({
    onPrompt: async (messages, expected) => {
      console.log("\n=== PROMPT (copy into your IDE model) ===\n");
      for (const m of messages) {
        console.log(`--- ${m.role.toUpperCase()} ---\n${m.content}\n`);
      }
      console.log(`\nExpected: ${expected}\n`);
      const out = await ask("Paste model JSON output here (single line or multi-line; end with ENTER):\n");
      return out;
    },
  });

  const res = await runOrchestration({
    mcp: {
      command: "node",
      args: ["dist/cli.js", "serve", "--modes-path", "./custom_modes.d", "--policy", "./policy.example.json"],
    },
    adapter,
    task: { goal: "Add a small example endpoint", context: { techStack: ["node", "typescript"] } },
    flow: { usePlanPrompt: true, useReview: true, autoApply: false },
    onLog: (m) => console.error(`[client] ${m}`),
  });

  console.log("\nRESULT:\n", res);
  rl.close();
}

main().catch((e) => {
  console.error(e);
  rl.close();
  process.exit(1);
});
