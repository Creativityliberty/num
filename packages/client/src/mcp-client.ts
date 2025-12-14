#!/usr/bin/env node
import fetch from "node-fetch";
import { z } from "zod";

const args = process.argv.slice(2);

const ArgsSchema = z.object({
  goal: z.string(),
  mode: z.string().optional(),
  action: z.enum(["list", "plan", "run"]).default("run"),
  host: z.string().default("http://localhost:3001"),
});

function parseArgs(argv: string[]) {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (!value?.startsWith("--")) {
        result[key] = value;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

async function callTool(
  host: string,
  tool: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${host}/mcp/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
  });
  if (!res.ok) {
    throw new Error(`Tool call failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as unknown;
  return data;
}

async function main() {
  const parsed = parseArgs(args);
  const config = ArgsSchema.parse({
    goal: parsed.goal,
    mode: parsed.mode,
    action: parsed.action,
    host: parsed.host,
  });

  console.log(`\n📋 Num Agents Client\n`);
  console.log(`Goal: ${config.goal}`);
  console.log(`Mode: ${config.mode || "(auto)"}`);
  console.log(`Action: ${config.action}`);
  console.log(`Host: ${config.host}\n`);

  try {
    if (config.action === "list") {
      console.log(`🔍 Listing modes...\n`);
      const result = await callTool(config.host, "modes.list", {
        query: config.goal,
      });
      console.log(JSON.stringify(result, null, 2));
    } else if (config.action === "plan") {
      console.log(`📐 Planning...\n`);
      const result = await callTool(config.host, "modes.plan", {
        goal: config.goal,
        modeId: config.mode,
      });
      console.log(JSON.stringify(result, null, 2));
    } else if (config.action === "run") {
      console.log(`🚀 Running orchestrate...\n`);
      const result = await callTool(config.host, "orchestrate.run", {
        goal: config.goal,
        modeId: config.mode,
      });
      console.log(JSON.stringify(result, null, 2));
      if (typeof result === "object" && result !== null && "runId" in result) {
        const runId = (result as Record<string, unknown>).runId;
        console.log(`\n✅ Run created: ${runId}`);
        console.log(`📊 Dashboard: http://localhost:3002`);
      }
    }
  } catch (e) {
    console.error(`❌ Error: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

main();
