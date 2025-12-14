#!/usr/bin/env node

/**
 * Test MCP API Calls - Complete System Testing
 * Makes API calls to all endpoints configured in mcp.json
 */

const API_KEY = process.argv[2];
const BASE_URL = "http://127.0.0.1:3457";

if (!API_KEY) {
  console.error("❌ Usage: node test-mcp-api-calls.mjs <GEMINI_API_KEY>");
  process.exit(1);
}

// ============================================================================
// API ENDPOINTS FROM MCP.JSON
// ============================================================================

const endpoints = {
  dashboard: `${BASE_URL}`,
  catalog: `${BASE_URL}/api/catalog`,
  customModes: `${BASE_URL}/api/custom-modes`,
  mcpTools: `${BASE_URL}/api/mcp/tools`,
  geminiHandlers: `${BASE_URL}/api/gemini/handlers`,
  geminiConfig: `${BASE_URL}/api/gemini/config`,
  geminiTest: `${BASE_URL}/api/gemini/test`,
  flowStatus: `${BASE_URL}/api/flow/status`,
  pages: {
    geminiHandlers: `${BASE_URL}/gemini-handlers`,
    flowVisualizer: `${BASE_URL}/flow-visualizer`,
    handlerSelector: `${BASE_URL}/api/components/handler-selector`,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function makeRequest(url, method = "GET") {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const status = response.status;
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { status, data, ok: response.ok };
  } catch (error) {
    return {
      status: 0,
      data: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function displayHeader(title) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${title}`);
  console.log(`${"=".repeat(70)}\n`);
}

function displayResult(name, url, result) {
  const status = result.ok ? "✅" : "❌";
  const code = result.status || "N/A";
  console.log(`${status} ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Status: ${code}`);

  if (result.error) {
    console.log(`   Error: ${result.error}`);
  } else if (result.data) {
    if (typeof result.data === "string") {
      const preview = result.data.substring(0, 100);
      console.log(`   Data: ${preview}${result.data.length > 100 ? "..." : ""}`);
    } else {
      const dataStr = JSON.stringify(result.data);
      const preview = dataStr.substring(0, 100);
      console.log(`   Data: ${preview}${dataStr.length > 100 ? "..." : ""}`);
    }
  }
  console.log();
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testDashboard() {
  displayHeader("🎨 DASHBOARD PAGES");

  const pages = [
    { name: "Main Dashboard", url: `${BASE_URL}/` },
    { name: "Catalog", url: `${BASE_URL}/catalog` },
    { name: "Custom Modes", url: `${BASE_URL}/custom-modes` },
    { name: "Agent Detail", url: `${BASE_URL}/agent-detail` },
    { name: "Editor", url: `${BASE_URL}/editor` },
    { name: "Playground", url: `${BASE_URL}/playground` },
    { name: "Scoring", url: `${BASE_URL}/scoring` },
    { name: "Model Health", url: `${BASE_URL}/model-health` },
    { name: "Gemini Handlers", url: endpoints.pages.geminiHandlers },
    { name: "Flow Visualizer", url: endpoints.pages.flowVisualizer },
  ];

  let successCount = 0;
  for (const page of pages) {
    const result = await makeRequest(page.url);
    displayResult(page.name, page.url, result);
    if (result.ok) successCount++;
  }

  return { total: pages.length, success: successCount };
}

async function testApiEndpoints() {
  displayHeader("📡 API ENDPOINTS");

  const apiEndpoints = [
    { name: "Catalog", url: endpoints.catalog },
    { name: "Custom Modes", url: endpoints.customModes },
    { name: "MCP Tools", url: endpoints.mcpTools },
    { name: "Gemini Handlers", url: endpoints.geminiHandlers },
    { name: "Gemini Config", url: endpoints.geminiConfig },
    { name: "Flow Status", url: endpoints.flowStatus },
  ];

  let successCount = 0;
  for (const endpoint of apiEndpoints) {
    const result = await makeRequest(endpoint.url);
    displayResult(endpoint.name, endpoint.url, result);
    if (result.ok) successCount++;
  }

  return { total: apiEndpoints.length, success: successCount };
}

async function testAgentAccess() {
  displayHeader("🤖 AGENT ACCESS TEST");

  const result = await makeRequest(endpoints.catalog);

  if (result.ok && result.data && typeof result.data === "object") {
    const data = result.data;
    console.log(`✅ Catalog API Accessible`);
    console.log(`   Total Agents: ${data.total || "N/A"}`);
    console.log(`   Catalog Agents: ${data.catalogAgents || "N/A"}`);
    console.log(`   Custom Modes: ${data.customModes || "N/A"}`);

    if (data.agents && Array.isArray(data.agents)) {
      console.log(`\n   Sample Agents:`);
      data.agents.slice(0, 5).forEach((agent, idx) => {
        console.log(`   ${idx + 1}. ${agent.name || agent.id}`);
      });
      if (data.agents.length > 5) {
        console.log(`   ... and ${data.agents.length - 5} more`);
      }
    }
    return { success: true, agents: data.agents?.length || 0 };
  } else {
    console.log(`❌ Failed to access catalog`);
    return { success: false, agents: 0 };
  }
}

async function testHandlers() {
  displayHeader("⚡ GEMINI HANDLERS TEST");

  const result = await makeRequest(endpoints.geminiHandlers);

  if (result.ok && result.data && typeof result.data === "object") {
    const data = result.data;
    console.log(`✅ Handlers API Accessible`);
    console.log(`   Total Handlers: ${data.total || "N/A"}`);

    if (data.handlers && Array.isArray(data.handlers)) {
      console.log(`\n   Available Handlers:`);
      data.handlers.forEach((handler, idx) => {
        console.log(`   ${idx + 1}. ${handler.name}`);
        console.log(`      Status: ${handler.status}`);
      });
    }
    return { success: true, handlers: data.handlers?.length || 0 };
  } else {
    console.log(`❌ Failed to access handlers`);
    return { success: false, handlers: 0 };
  }
}

async function testFlowStatus() {
  displayHeader("🔄 FLOW STATUS TEST");

  const result = await makeRequest(endpoints.flowStatus);

  if (result.ok && result.data && typeof result.data === "object") {
    const data = result.data;
    console.log(`✅ Flow Status API Accessible`);

    if (data.flow && data.flow.phases) {
      console.log(`\n   NumFlow Phases:`);
      data.flow.phases.forEach((phase, idx) => {
        console.log(`   ${idx + 1}. ${phase.name}`);
        console.log(`      Agent: ${phase.agent}`);
        console.log(`      Status: ${phase.status}`);
        console.log(`      Handlers: ${phase.handlers}`);
      });

      console.log(`\n   Summary:`);
      console.log(`   Total Agents: ${data.flow.totalAgents}`);
      console.log(`   Total Handlers: ${data.flow.totalHandlers}`);
      console.log(`   Coverage: ${data.flow.coverage}`);
    }
    return { success: true, phases: data.flow?.phases?.length || 0 };
  } else {
    console.log(`❌ Failed to access flow status`);
    return { success: false, phases: 0 };
  }
}

async function testTools() {
  displayHeader("🛠️ MCP TOOLS TEST");

  const result = await makeRequest(endpoints.mcpTools);

  if (result.ok && result.data && typeof result.data === "object") {
    const data = result.data;
    console.log(`✅ Tools API Accessible`);
    console.log(`   Total Tools: ${data.total || "N/A"}`);

    if (data.tools && Array.isArray(data.tools)) {
      console.log(`\n   Available Tools:`);
      data.tools.slice(0, 7).forEach((tool, idx) => {
        console.log(`   ${idx + 1}. ${tool.name}`);
      });
      if (data.tools.length > 7) {
        console.log(`   ... and ${data.tools.length - 7} more`);
      }
    }
    return { success: true, tools: data.tools?.length || 0 };
  } else {
    console.log(`❌ Failed to access tools`);
    return { success: false, tools: 0 };
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🚀 MCP API CALLS TEST - COMPLETE SYSTEM VALIDATION`);
  console.log(`${"=".repeat(70)}`);

  console.log(`\n📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  const results = {};

  // Run all tests
  results.dashboard = await testDashboard();
  results.api = await testApiEndpoints();
  results.agents = await testAgentAccess();
  results.handlers = await testHandlers();
  results.flow = await testFlowStatus();
  results.tools = await testTools();

  // ========================================================================
  // SUMMARY REPORT
  // ========================================================================

  displayHeader("📊 TEST SUMMARY REPORT");

  const totalTests =
    (results.dashboard?.total || 0) +
    (results.api?.total || 0) +
    1 +
    1 +
    1 +
    1;

  const totalSuccess =
    (results.dashboard?.success || 0) +
    (results.api?.success || 0) +
    (results.agents?.success ? 1 : 0) +
    (results.handlers?.success ? 1 : 0) +
    (results.flow?.success ? 1 : 0) +
    (results.tools?.success ? 1 : 0);

  console.log(`Dashboard Pages: ${results.dashboard?.success}/${results.dashboard?.total}`);
  console.log(`API Endpoints: ${results.api?.success}/${results.api?.total}`);
  console.log(`Agents: ${results.agents?.success ? "✅" : "❌"}`);
  console.log(`Handlers: ${results.handlers?.success ? "✅" : "❌"}`);
  console.log(`Flow: ${results.flow?.success ? "✅" : "❌"}`);
  console.log(`Tools: ${results.tools?.success ? "✅" : "❌"}`);

  console.log(`\n📈 Overall: ${totalSuccess}/${totalTests} tests passed`);
  const percentage = Math.round((totalSuccess / totalTests) * 100);
  console.log(`Success Rate: ${percentage}%`);

  // ========================================================================
  // SYSTEM STATUS
  // ========================================================================

  displayHeader("✅ SYSTEM STATUS");

  console.log(`Agents Available: ${results.agents?.agents || 0}`);
  console.log(`Handlers Available: ${results.handlers?.handlers || 0}`);
  console.log(`Flow Phases: ${results.flow?.phases || 0}`);
  console.log(`Tools Available: ${results.tools?.tools || 0}`);

  if (totalSuccess === totalTests) {
    console.log(`\n🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL`);
  } else {
    console.log(`\n⚠️  Some tests failed - Check configuration`);
  }

  // ========================================================================
  // NEXT STEPS
  // ========================================================================

  displayHeader("🚀 NEXT STEPS");

  console.log(`1. Access Dashboard:`);
  console.log(`   ${BASE_URL}`);

  console.log(`\n2. Browse Agents:`);
  console.log(`   ${endpoints.catalog}`);

  console.log(`\n3. View Handlers:`);
  console.log(`   ${endpoints.geminiHandlers}`);

  console.log(`\n4. Check Flow Status:`);
  console.log(`   ${endpoints.flowStatus}`);

  console.log(`\n5. Run Full System Test:`);
  console.log(`   node scripts/test-system.mjs ${API_KEY.substring(0, 10)}...`);

  console.log(`\n${"=".repeat(70)}\n`);
}

// Run tests
runAllTests().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});
