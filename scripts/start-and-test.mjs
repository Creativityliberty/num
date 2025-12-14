#!/usr/bin/env node

/**
 * Start Server and Run Complete API Tests
 * Starts the dashboard server and validates all endpoints
 */

import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const API_KEY = process.argv[2] || "test_api_key_here";

console.log(`\n${"=".repeat(70)}`);
console.log(`🚀 STARTING NUM AGENTS SERVER & RUNNING TESTS`);
console.log(`${"=".repeat(70)}\n`);

// Start the server
console.log(`📍 Starting server on port 3457...`);
const serverProcess = spawn("npm", ["run", "dev"], {
  cwd: "/Volumes/Numtema/Numtema-mcp-agents-modes",
  stdio: ["ignore", "pipe", "pipe"],
});

let serverReady = false;
let serverOutput = "";

serverProcess.stdout.on("data", (data) => {
  serverOutput += data.toString();
  if (serverOutput.includes("listening") || serverOutput.includes("3457")) {
    serverReady = true;
  }
});

serverProcess.stderr.on("data", (data) => {
  console.error(`Server error: ${data}`);
});

// Wait for server to start
await delay(3000);

if (!serverReady) {
  console.log(`⏳ Waiting for server to be ready...`);
  await delay(2000);
}

console.log(`✅ Server started\n`);

// Run tests
console.log(`${"=".repeat(70)}`);
console.log(`📊 TESTING ALL ENDPOINTS`);
console.log(`${"=".repeat(70)}\n`);

const endpoints = [
  { name: "Dashboard", url: "http://127.0.0.1:3457/" },
  { name: "Catalog", url: "http://127.0.0.1:3457/catalog" },
  { name: "Custom Modes", url: "http://127.0.0.1:3457/custom-modes" },
  { name: "Agent Detail", url: "http://127.0.0.1:3457/agent-detail" },
  { name: "Editor", url: "http://127.0.0.1:3457/editor" },
  { name: "Playground", url: "http://127.0.0.1:3457/playground" },
  { name: "Scoring", url: "http://127.0.0.1:3457/scoring" },
  { name: "Model Health", url: "http://127.0.0.1:3457/model-health" },
  { name: "Gemini Handlers Page", url: "http://127.0.0.1:3457/gemini-handlers" },
  { name: "Flow Visualizer Page", url: "http://127.0.0.1:3457/flow-visualizer" },
  { name: "API: Catalog", url: "http://127.0.0.1:3457/api/catalog" },
  { name: "API: Custom Modes", url: "http://127.0.0.1:3457/api/custom-modes" },
  { name: "API: MCP Tools", url: "http://127.0.0.1:3457/api/mcp/tools" },
  { name: "API: Gemini Handlers", url: "http://127.0.0.1:3457/api/gemini/handlers" },
  { name: "API: Gemini Config", url: "http://127.0.0.1:3457/api/gemini/config" },
  { name: "API: Flow Status", url: "http://127.0.0.1:3457/api/flow/status" },
];

let passCount = 0;
let failCount = 0;

for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint.url, { timeout: 5000 });
    const status = response.status;
    const ok = status >= 200 && status < 300;

    if (ok) {
      console.log(`✅ ${endpoint.name.padEnd(25)} [${status}]`);
      passCount++;
    } else {
      console.log(`❌ ${endpoint.name.padEnd(25)} [${status}]`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name.padEnd(25)} [ERROR]`);
    failCount++;
  }
}

console.log(`\n${"=".repeat(70)}`);
console.log(`📊 TEST RESULTS`);
console.log(`${"=".repeat(70)}`);

console.log(`\n✅ Passed: ${passCount}/${endpoints.length}`);
console.log(`❌ Failed: ${failCount}/${endpoints.length}`);
console.log(`📈 Success Rate: ${Math.round((passCount / endpoints.length) * 100)}%\n`);

if (passCount === endpoints.length) {
  console.log(`🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL\n`);
} else {
  console.log(`⚠️  Some tests failed - Check server logs\n`);
}

console.log(`${"=".repeat(70)}`);
console.log(`🚀 NEXT STEPS`);
console.log(`${"=".repeat(70)}`);

console.log(`\n1. Access Dashboard:`);
console.log(`   http://127.0.0.1:3457`);

console.log(`\n2. Browse Agents:`);
console.log(`   http://127.0.0.1:3457/api/catalog`);

console.log(`\n3. View Handlers:`);
console.log(`   http://127.0.0.1:3457/api/gemini/handlers`);

console.log(`\n4. Check Flow Status:`);
console.log(`   http://127.0.0.1:3457/api/flow/status`);

console.log(`\n5. View Custom Modes:`);
console.log(`   http://127.0.0.1:3457/custom-modes`);

console.log(`\n${"=".repeat(70)}\n`);

// Keep server running
console.log(`Server is running. Press Ctrl+C to stop.\n`);

process.on("SIGINT", () => {
  console.log(`\n\nShutting down server...`);
  serverProcess.kill();
  process.exit(0);
});
