#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { AnthropicAdapter } from "./llm/adapters/anthropic.js";
import { OpenAIAdapter } from "./llm/adapters/openai.js";
import { McpToolClient } from "./mcp/client.js";
import { McpHttpClient } from "./mcp/httpClient.js";
import { runMultiAgentsSerial } from "./orchestrator/multiRunner.js";

type TransportConfig = {
  type: "http" | "stdio";
  baseUrl?: string;
  tokenEnv?: string;
  command?: string;
  args?: string[];
};

type ModelConfig = {
  provider: "openai" | "anthropic";
  model: string;
};

type Config = {
  transport: TransportConfig;
  models?: Record<string, ModelConfig>;
};

function readConfig(configPath?: string): Config {
  const p =
    configPath ??
    process.env.NUM_AGENTS_CONFIG ??
    path.join(process.cwd(), ".num-agents", "config.json");

  if (!fs.existsSync(p)) {
    throw new Error(`Missing config: ${p}\nCopy .num-agents/config.example.json to .num-agents/config.json`);
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Config;
}

function arg(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function has(name: string): boolean {
  return process.argv.includes(name);
}

function printUsage() {
  console.error(`Usage:
  num-agents tools [--config path]
  num-agents run --goal "..." [--mode num:code-fix] [--multi] [--auto-apply true|false] [--config path]

Examples:
  num-agents tools
  num-agents run --goal "Fix failing test X" --mode num:code-fix
  num-agents run --multi --goal "Implement feature Y" --auto-apply false
`);
}

async function main() {
  const cmd = process.argv[2];

  if (!cmd || !["run", "tools", "help", "--help", "-h"].includes(cmd)) {
    printUsage();
    process.exit(1);
  }

  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    printUsage();
    process.exit(0);
  }

  const configPath = arg("--config") ?? undefined;
  const cfg = readConfig(configPath);

  // Create MCP client based on transport type
  let mcp: McpHttpClient | McpToolClient;

  if (cfg.transport.type === "http") {
    const token = cfg.transport.tokenEnv ? process.env[cfg.transport.tokenEnv] : undefined;
    if (!cfg.transport.baseUrl) {
      throw new Error("transport.baseUrl required for http transport");
    }
    mcp = new McpHttpClient({ baseUrl: cfg.transport.baseUrl, token });
  } else {
    const command = cfg.transport.command ?? "node";
    const args = cfg.transport.args ?? ["dist/cli.js", "serve"];
    mcp = await McpToolClient.connectStdio({ command, args });
  }

  // Command: tools
  if (cmd === "tools") {
    try {
      const tools = await mcp.listTools();
      console.log(JSON.stringify(tools, null, 2));
    } finally {
      if (mcp instanceof McpToolClient) {
        await mcp.close();
      }
    }
    return;
  }

  // Command: run
  const goal = arg("--goal");
  if (!goal) {
    console.error("Error: --goal is required");
    printUsage();
    process.exit(1);
  }

  const modeId = arg("--mode") ?? "num:code-fix";
  const autoApply = (arg("--auto-apply") ?? "false") === "true";
  const useMulti = has("--multi");

  // Create adapters based on config
  const mkAdapter = (role: string) => {
    const m = cfg.models?.[role];
    if (!m) {
      // Fallback to OpenAI
      const apiKey = process.env.OPENAI_API_KEY ?? "";
      if (!apiKey) {
        console.error(`Warning: No model config for role "${role}" and OPENAI_API_KEY not set`);
      }
      return new OpenAIAdapter({ apiKey, model: "gpt-4.1-mini" });
    }

    if (m.provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
      if (!apiKey) {
        console.error(`Warning: ANTHROPIC_API_KEY not set for role "${role}"`);
      }
      return new AnthropicAdapter({ apiKey, model: m.model });
    }

    const apiKey = process.env.OPENAI_API_KEY ?? "";
    if (!apiKey) {
      console.error(`Warning: OPENAI_API_KEY not set for role "${role}"`);
    }
    return new OpenAIAdapter({ apiKey, model: m.model });
  };

  try {
    if (useMulti) {
      const result = await runMultiAgentsSerial({
        mcp: mcp as McpHttpClient,
        adapters: {
          planner: mkAdapter("planner"),
          implementer: mkAdapter("implementer"),
          reviewer: mkAdapter("reviewer"),
          security: mkAdapter("security"),
        },
        task: { goal },
        modeId,
        autoApply,
        onLog: (x: unknown) => console.error(JSON.stringify(x)),
      });
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Simple single-adapter run (uses planner for all steps)
      const result = await runMultiAgentsSerial({
        mcp: mcp as McpHttpClient,
        adapters: {
          planner: mkAdapter("planner"),
          implementer: mkAdapter("planner"),
          reviewer: mkAdapter("planner"),
          security: mkAdapter("planner"),
        },
        task: { goal },
        modeId,
        autoApply,
        onLog: (x: unknown) => console.error(JSON.stringify(x)),
      });
      console.log(JSON.stringify(result, null, 2));
    }
  } finally {
    if (mcp instanceof McpToolClient) {
      await mcp.close();
    }
  }
}

main().catch((e: Error) => {
  console.error(e.stack ?? String(e));
  process.exit(1);
});
