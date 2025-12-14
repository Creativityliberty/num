#!/usr/bin/env node

/**
 * Demo: Using an Agent with MCP, Tools, and Flow
 * Shows how to execute a task using agents with full MCP integration
 */

const API_KEY = process.argv[2] || "test_api_key_here";
const AGENT_ID = process.argv[3] || "analysis-agent";
const TASK = process.argv[4] || "Analyze the requirements for building a web application";

console.log(`\n${"=".repeat(70)}`);
console.log(`🤖 AGENT TASK EXECUTION DEMO`);
console.log(`${"=".repeat(70)}\n`);

console.log(`📋 Configuration:`);
console.log(`   API Key: ${API_KEY.substring(0, 10)}...`);
console.log(`   Agent: ${AGENT_ID}`);
console.log(`   Task: ${TASK}\n`);

// ============================================================================
// STEP 1: AGENT SELECTION
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 1: SELECT AGENT`);
console.log(`${"=".repeat(70)}\n`);

const agents = {
  "analysis-agent": {
    name: "Analysis Agent",
    role: "Requirements Analyst",
    description: "Analyzes requirements and breaks down complex problems",
    tools: ["llm-call", "function-call", "research"],
    handlers: ["Config", "LLM", "FunctionCalling"],
  },
  "planning-agent": {
    name: "Planning Agent",
    role: "Project Planner",
    description: "Creates detailed plans with dependencies and timelines",
    tools: ["llm-call", "long-context", "rag-retrieve"],
    handlers: ["LLM", "LongContext", "RAG"],
  },
  "solutioning-agent": {
    name: "Solutioning Agent",
    role: "Solution Architect",
    description: "Designs solutions with research and tool integration",
    tools: ["llm-call", "function-call", "computer-use", "deep-research"],
    handlers: ["LLM", "FunctionCalling", "ComputerUse", "DeepResearch"],
  },
  "implementation-agent": {
    name: "Implementation Agent",
    role: "Implementation Lead",
    description: "Executes implementation with batch processing",
    tools: ["llm-call", "batch-submit", "caching-tokens", "computer-use"],
    handlers: ["LLM", "BatchProcessing", "CachingTokens", "ComputerUse"],
  },
};

const selectedAgent = agents[AGENT_ID] || agents["analysis-agent"];

console.log(`✅ Selected Agent: ${selectedAgent.name}`);
console.log(`   Role: ${selectedAgent.role}`);
console.log(`   Description: ${selectedAgent.description}`);
console.log(`   Tools: ${selectedAgent.tools.join(", ")}`);
console.log(`   Handlers: ${selectedAgent.handlers.join(", ")}\n`);

// ============================================================================
// STEP 2: LOAD MCP TOOLS
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 2: LOAD MCP TOOLS`);
console.log(`${"=".repeat(70)}\n`);

const mcpTools = [
  { name: "llm-call", description: "Call LLM with prompt", handler: "LLMHandler" },
  { name: "function-call", description: "Execute functions", handler: "FunctionCallingHandler" },
  { name: "computer-use", description: "Browser automation", handler: "ComputerUseHandler" },
  { name: "batch-submit", description: "Submit batch jobs", handler: "BatchProcessingHandler" },
  { name: "caching-tokens", description: "Manage token cache", handler: "CachingTokensHandler" },
  { name: "long-context", description: "Process long context", handler: "LongContextHandler" },
  { name: "embeddings", description: "Generate embeddings", handler: "EmbeddingsRAGHandler" },
  { name: "rag-retrieve", description: "Retrieve documents", handler: "EmbeddingsRAGHandler" },
  { name: "research", description: "Execute research", handler: "DeepResearchAgentHandler" },
  { name: "file-upload", description: "Upload files", handler: "LongContextHandler" },
  { name: "file-list", description: "List files", handler: "LongContextHandler" },
  { name: "file-delete", description: "Delete files", handler: "LongContextHandler" },
  { name: "pdf-process", description: "Process PDFs", handler: "LongContextHandler" },
  { name: "video-process", description: "Process videos", handler: "LongContextHandler" },
];

const agentTools = selectedAgent.tools
  .map((toolName) => mcpTools.find((t) => t.name === toolName))
  .filter(Boolean);

console.log(`✅ Loaded ${agentTools.length} tools for agent:`);
agentTools.forEach((tool, idx) => {
  console.log(`   ${idx + 1}. ${tool.name}`);
  console.log(`      Description: ${tool.description}`);
  console.log(`      Handler: ${tool.handler}`);
});
console.log();

// ============================================================================
// STEP 3: INITIALIZE HANDLERS
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 3: INITIALIZE GEMINI HANDLERS`);
console.log(`${"=".repeat(70)}\n`);

const handlers = {
  Config: { name: "GeminiConfigManager", status: "initialized" },
  LLM: { name: "LLMHandler", status: "initialized", model: "gemini-2.5-flash" },
  FunctionCalling: { name: "FunctionCallingHandler", status: "initialized" },
  ComputerUse: { name: "ComputerUseHandler", status: "initialized" },
  BatchProcessing: { name: "BatchProcessingHandler", status: "initialized" },
  CachingTokens: { name: "CachingTokensHandler", status: "initialized" },
  LongContext: { name: "LongContextHandler", status: "initialized" },
  RAG: { name: "EmbeddingsRAGHandler", status: "initialized" },
  DeepResearch: { name: "DeepResearchAgentHandler", status: "initialized" },
};

const agentHandlers = selectedAgent.handlers
  .map((h) => handlers[h])
  .filter(Boolean);

console.log(`✅ Initialized ${agentHandlers.length} handlers:`);
agentHandlers.forEach((handler, idx) => {
  console.log(`   ${idx + 1}. ${handler.name}`);
  console.log(`      Status: ${handler.status}`);
  if (handler.model) console.log(`      Model: ${handler.model}`);
});
console.log();

// ============================================================================
// STEP 4: PREPARE TASK
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 4: PREPARE TASK`);
console.log(`${"=".repeat(70)}\n`);

const taskData = {
  id: `task-${Date.now()}`,
  agent: AGENT_ID,
  description: TASK,
  tools: agentTools.map((t) => t.name),
  handlers: agentHandlers.map((h) => h.name),
  status: "prepared",
  createdAt: new Date().toISOString(),
};

console.log(`✅ Task Prepared:`);
console.log(`   ID: ${taskData.id}`);
console.log(`   Agent: ${taskData.agent}`);
console.log(`   Description: ${taskData.description}`);
console.log(`   Tools: ${taskData.tools.join(", ")}`);
console.log(`   Handlers: ${taskData.handlers.join(", ")}`);
console.log(`   Status: ${taskData.status}\n`);

// ============================================================================
// STEP 5: EXECUTE WITH FLOW
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 5: EXECUTE TASK WITH NUMFLOW`);
console.log(`${"=".repeat(70)}\n`);

const flowPhases = [
  {
    name: "Analysis",
    agent: "analysis-agent",
    handlers: ["Config", "LLM", "FunctionCalling"],
    description: "Break down requirements and analyze context",
  },
  {
    name: "Planning",
    agent: "planning-agent",
    handlers: ["LLM", "LongContext", "RAG"],
    description: "Create detailed plans with dependencies",
  },
  {
    name: "Solutioning",
    agent: "solutioning-agent",
    handlers: ["LLM", "FunctionCalling", "ComputerUse", "DeepResearch"],
    description: "Design solutions with research",
  },
  {
    name: "Implementation",
    agent: "implementation-agent",
    handlers: ["LLM", "BatchProcessing", "CachingTokens", "ComputerUse"],
    description: "Execute implementation with optimization",
  },
];

console.log(`📊 NumFlow Phases:`);
flowPhases.forEach((phase, idx) => {
  const isActive = phase.agent === AGENT_ID;
  const status = isActive ? "🔄 ACTIVE" : "⏳ READY";
  console.log(`\n   ${idx + 1}. ${phase.name} ${status}`);
  console.log(`      Agent: ${phase.agent}`);
  console.log(`      Description: ${phase.description}`);
  console.log(`      Handlers: ${phase.handlers.join(", ")}`);
});
console.log();

// ============================================================================
// STEP 6: SIMULATE EXECUTION
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 6: SIMULATE TASK EXECUTION`);
console.log(`${"=".repeat(70)}\n`);

const executionSteps = [
  { step: "Initialize", status: "✅", duration: "100ms" },
  { step: "Load Agent Config", status: "✅", duration: "50ms" },
  { step: "Initialize Handlers", status: "✅", duration: "150ms" },
  { step: "Load Tools", status: "✅", duration: "75ms" },
  { step: "Prepare Prompt", status: "✅", duration: "200ms" },
  { step: "Call LLM (Gemini)", status: "✅", duration: "2500ms" },
  { step: "Process Response", status: "✅", duration: "300ms" },
  { step: "Execute Tools", status: "✅", duration: "1200ms" },
  { step: "Cache Results", status: "✅", duration: "100ms" },
  { step: "Generate Output", status: "✅", duration: "250ms" },
];

let totalDuration = 0;
console.log(`📈 Execution Steps:`);
executionSteps.forEach((step, idx) => {
  const duration = parseInt(step.duration);
  totalDuration += duration;
  console.log(`   ${idx + 1}. ${step.step.padEnd(25)} ${step.status} (${step.duration})`);
});

console.log(`\n   Total Duration: ${totalDuration}ms\n`);

// ============================================================================
// STEP 7: RESULTS
// ============================================================================

console.log(`${"=".repeat(70)}`);
console.log(`STEP 7: TASK RESULTS`);
console.log(`${"=".repeat(70)}\n`);

const results = {
  taskId: taskData.id,
  agent: AGENT_ID,
  status: "completed",
  duration: `${totalDuration}ms`,
  tokensUsed: Math.floor(Math.random() * 5000) + 1000,
  costEstimate: `$${(Math.random() * 0.05).toFixed(4)}`,
  output: {
    summary: `Task completed successfully using ${selectedAgent.name}`,
    findings: [
      "Key requirement identified: Clear system architecture",
      "Dependencies mapped: Frontend, Backend, Database",
      "Risk assessment: Medium complexity, 4-week timeline",
      "Recommended approach: Agile with 2-week sprints",
    ],
    recommendations: [
      "Use modern tech stack (React, Node.js, PostgreSQL)",
      "Implement CI/CD pipeline",
      "Set up monitoring and logging",
      "Plan for scalability from day 1",
    ],
  },
  handlers: {
    used: agentHandlers.map((h) => h.name),
    tokensOptimized: "Yes (caching enabled)",
    costSavings: "45% (batch processing + caching)",
  },
  tools: {
    executed: agentTools.slice(0, 3).map((t) => t.name),
    successful: agentTools.slice(0, 3).length,
    failed: 0,
  },
};

console.log(`✅ Task Completed`);
console.log(`   Status: ${results.status}`);
console.log(`   Duration: ${results.duration}`);
console.log(`   Tokens Used: ${results.tokensUsed}`);
console.log(`   Cost Estimate: ${results.costEstimate}`);

console.log(`\n📋 Summary:`);
console.log(`   ${results.output.summary}`);

console.log(`\n🔍 Key Findings:`);
results.output.findings.forEach((finding, idx) => {
  console.log(`   ${idx + 1}. ${finding}`);
});

console.log(`\n💡 Recommendations:`);
results.output.recommendations.forEach((rec, idx) => {
  console.log(`   ${idx + 1}. ${rec}`);
});

console.log(`\n⚡ Handler Usage:`);
console.log(`   Handlers Used: ${results.handlers.used.join(", ")}`);
console.log(`   Tokens Optimized: ${results.handlers.tokensOptimized}`);
console.log(`   Cost Savings: ${results.handlers.costSavings}`);

console.log(`\n🛠️ Tools Execution:`);
console.log(`   Tools Executed: ${results.tools.executed.join(", ")}`);
console.log(`   Successful: ${results.tools.successful}`);
console.log(`   Failed: ${results.tools.failed}`);

// ============================================================================
// STEP 8: SUMMARY
// ============================================================================

console.log(`\n${"=".repeat(70)}`);
console.log(`SUMMARY: HOW IT ALL WORKS TOGETHER`);
console.log(`${"=".repeat(70)}\n`);

console.log(`1️⃣  AGENT SELECTION`);
console.log(`    • Choose agent based on task type`);
console.log(`    • ${selectedAgent.name} selected for this task`);

console.log(`\n2️⃣  TOOLS LOADING`);
console.log(`    • Load ${agentTools.length} tools available to agent`);
console.log(`    • Each tool maps to a Gemini handler`);

console.log(`\n3️⃣  HANDLER INITIALIZATION`);
console.log(`    • Initialize ${agentHandlers.length} Gemini handlers`);
console.log(`    • Configure models, caching, batch processing`);

console.log(`\n4️⃣  TASK EXECUTION`);
console.log(`    • Agent processes task with loaded tools`);
console.log(`    • Handlers manage LLM calls and optimizations`);

console.log(`\n5️⃣  FLOW ORCHESTRATION`);
console.log(`    • Task flows through NumFlow phases`);
console.log(`    • Each phase uses different agents and handlers`);

console.log(`\n6️⃣  RESULTS & OPTIMIZATION`);
console.log(`    • Results cached for future use`);
console.log(`    • Costs optimized (${results.handlers.costSavings})`);
console.log(`    • Tokens managed efficiently`);

console.log(`\n${"=".repeat(70)}`);
console.log(`✅ AGENT TASK EXECUTION COMPLETE`);
console.log(`${"=".repeat(70)}\n`);

console.log(`📚 Documentation:`);
console.log(`   • Full MCP Access: FINAL_SUMMARY.md`);
console.log(`   • Quick Reference: MCP_QUICK_REFERENCE.md`);
console.log(`   • Production Ready: PRODUCTION_READINESS.md`);

console.log(`\n🚀 Try Other Agents:`);
console.log(`   node scripts/demo-agent-task.mjs ${API_KEY} planning-agent "Create a project plan"`);
console.log(`   node scripts/demo-agent-task.mjs ${API_KEY} solutioning-agent "Design a solution"`);
console.log(`   node scripts/demo-agent-task.mjs ${API_KEY} implementation-agent "Execute implementation"`);

console.log(`\n`);
