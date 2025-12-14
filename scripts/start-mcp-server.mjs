#!/usr/bin/env node

/**
 * MCP Server Wrapper
 * Standalone MCP server that can be used like any other MCP server
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Configuration
const config = {
  command: "node",
  args: ["dist/src/cli.js", "serve", "--modes-path", "./custom_modes.d", "--dashboard", "--dashboard-port", "3457"],
  cwd: projectRoot,
  env: {
    ...process.env,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },
};

console.log(`\n${"=".repeat(80)}`);
console.log(`🚀 MCP SERVER - Num Agents v3.0`);
console.log(`${"=".repeat(80)}\n`);

console.log(`📋 Configuration:`);
console.log(`   Command: ${config.command} ${config.args.join(" ")}`);
console.log(`   Working Directory: ${config.cwd}`);
console.log(`   Port: 3457`);
console.log(`   Dashboard: http://127.0.0.1:3457\n`);

// Start server
const server = spawn(config.command, config.args, {
  cwd: config.cwd,
  env: config.env,
  stdio: "inherit",
});

server.on("error", (err) => {
  console.error(`❌ Server Error: ${err.message}`);
  process.exit(1);
});

server.on("exit", (code) => {
  if (code === 0) {
    console.log(`\n✅ Server stopped gracefully`);
  } else {
    console.error(`\n❌ Server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle signals
process.on("SIGINT", () => {
  console.log(`\n📍 Shutting down...`);
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log(`\n📍 Shutting down...`);
  server.kill("SIGTERM");
});

console.log(`✅ MCP Server Started`);
console.log(`📊 Dashboard: http://127.0.0.1:3457`);
console.log(`🛠️  Tools: 14 available`);
console.log(`🤖 Agents: 28 available`);
console.log(`📡 API: http://127.0.0.1:3457/api/mcp/tools\n`);
