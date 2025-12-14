#!/usr/bin/env node
import pino from "pino";
import { z } from "zod";
import type { Policy } from "./core/policy.js";
import { defaultPolicy, loadPolicy } from "./core/policy.js";
import { startDashboard } from "./dashboard/server.js";
import { createEventBus } from "./obs/events.js";
import runOnboarding from "./onboarding/setup.js";
import { startMcpServer } from "./server/index.js";

// IMPORTANT (MCP stdio): never write logs to stdout.
// Route logs to stderr (fd=2) to avoid corrupting the protocol stream.
const log = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: { app: "mcp-agents-modes" },
  },
  pino.destination(2)
);

const ServeArgsSchema = z.object({
  modesPath: z.array(z.string().min(1)),
  dashboard: z.boolean().default(true),
  dashboardPort: z.number().int().min(1024).max(65535).default(17333),
  eventsFile: z.string().optional(),
  policyPath: z.string().optional(),
});

function parseServeArgs(argv: string[]): {
  modesPath: string[];
  dashboard: boolean;
  dashboardPort: number;
  eventsFile?: string;
  policyPath?: string;
} {
  const modesPath: string[] = [];
  let dashboard = true;
  let dashboardPort = 17333;
  let eventsFile: string | undefined;
  let policyPath: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--modes-path") {
      const v = argv[i + 1];
      if (typeof v === "string") {
        modesPath.push(v);
        i++;
      }
    }
    if (a === "--no-dashboard") dashboard = false;
    if (a === "--dashboard-port") {
      const v = argv[i + 1];
      if (typeof v === "string") {
        dashboardPort = Number(v);
        i++;
      }
    }
    if (a === "--events-file") {
      const v = argv[i + 1];
      if (typeof v === "string") {
        eventsFile = v;
        i++;
      }
    }
    if (a === "--policy") {
      const v = argv[i + 1];
      if (typeof v === "string") {
        policyPath = v;
        i++;
      }
    }
  }
  return {
    dashboard: dashboard ?? false,
    modesPath: modesPath.length ? modesPath : ["./"],
    dashboardPort: dashboardPort ?? 3457,
    eventsFile: eventsFile,
    policyPath: policyPath,
  } as any;
}

function help(): void {
  process.stdout.write(
    [
      "mcp-agents-modes",
      "",
      "Usage:",
      "  mcp-agents-modes setup                                           # Interactive setup wizard",
      "  mcp-agents-modes serve --modes-path <DIR> [options]             # Start MCP server",
      "",
      "Serve Options:",
      "  --modes-path <DIR>              Path to custom modes directory (can be repeated)",
      "  --policy <policy.json>          Security policy file",
      "  --no-dashboard                  Disable dashboard UI",
      "  --dashboard-port <PORT>         Dashboard port (default: 3457)",
      "  --events-file <PATH>            Event logging file",
      "",
      "Examples:",
      "  mcp-agents-modes setup",
      "  mcp-agents-modes serve --modes-path ./custom_modes.d --dashboard-port 3457",
      "  mcp-agents-modes serve --modes-path ./custom_modes.d --no-dashboard",
      "  mcp-agents-modes serve --modes-path ./custom_modes.d --policy ./policy.json",
      "",
    ].join("\n")
  );
}

async function main(): Promise<void> {
  const cmd = process.argv[2];

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    help();
    return;
  }

  if (cmd === "setup") {
    try {
      await runOnboarding();
      return;
    } catch (err) {
      console.error("Setup failed:", err);
      process.exitCode = 1;
      return;
    }
  }

  if (cmd === "serve") {
    const args = parseServeArgs(process.argv.slice(3));
    log.info({ modesPath: args.modesPath }, "Starting MCP server");
    const bus = createEventBus({ maxEvents: 2000, jsonlPath: args.eventsFile, log });

    let policy: Policy = defaultPolicy();
    if (args.policyPath) {
      policy = await loadPolicy(args.policyPath);
      log.info(
        {
          workspaceRoot: policy.workspaceRoot,
          allowWrite: policy.allowWrite,
          allowExec: policy.allowExec,
          allowGit: policy.allowGit,
        },
        "Policy loaded"
      );
    } else {
      log.info(
        { workspaceRoot: policy.workspaceRoot },
        "No policy provided: default safe policy (write/exec/git disabled)"
      );
    }

    if (args.dashboard) {
      const dash = await startDashboard({
        bus,
        port: args.dashboardPort,
        log,
        workspaceRoot: policy.workspaceRoot,
        policyPublic: {
          allowWrite: policy.allowWrite,
          allowExec: policy.allowExec,
          allowGit: policy.allowGit,
          allowedCommands: policy.allowedCommands ?? [],
          allowedWritePaths: policy.allowedWritePaths ?? [],
          blockedWritePaths: policy.blockedWritePaths ?? [],
          requireConfirmationFor: policy.requireConfirmationFor ?? [],
          rollbackCooldownSeconds: policy.rollbackCooldownSeconds ?? 300,
        },
      });
      log.info({ url: dash.url }, "Dashboard running");
    } else {
      log.info("Dashboard disabled");
    }

    await startMcpServer({ modesPaths: args.modesPath, bus, policy });
    return;
  }

  log.error({ cmd }, "Unknown command");
  process.exitCode = 2;
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
