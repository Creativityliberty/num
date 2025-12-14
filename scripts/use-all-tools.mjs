#!/usr/bin/env node

/**
 * Use All Tools - Complete Demonstration
 * Shows how to use all 14 MCP tools with real examples
 */

const API_KEY = process.argv[2] || "test_api_key_here";

console.log(`\n${"=".repeat(80)}`);
console.log(`🛠️  USE ALL 14 MCP TOOLS - Complete Demonstration`);
console.log(`${"=".repeat(80)}\n`);

// ============================================================================
// TOOL 1: llm-call
// ============================================================================

console.log(`TOOL 1: llm-call (LLMHandler)\n`);
console.log(`Description: Call Gemini API with prompt`);
console.log(`Handler: LLMHandler`);
console.log(`Usage Example:`);
console.log(`
  const result = await llmCall({
    prompt: "Analyze this code for bugs",
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 2000
  });
  // Returns: { response: "...", tokensUsed: 1234, cost: "$0.0045" }
`);
console.log(`✅ Used by: Analysis Agent, Planning Agent, Solutioning Agent, Implementation Agent\n`);

// ============================================================================
// TOOL 2: function-call
// ============================================================================

console.log(`TOOL 2: function-call (FunctionCallingHandler)\n`);
console.log(`Description: Execute registered functions`);
console.log(`Handler: FunctionCallingHandler`);
console.log(`Usage Example:`);
console.log(`
  const result = await functionCall({
    functionName: "calculateComplexity",
    args: { code: "...", language: "javascript" }
  });
  // Returns: { complexity: "O(n log n)", score: 8.5 }
`);
console.log(`✅ Used by: Analysis Agent, Solutioning Agent\n`);

// ============================================================================
// TOOL 3: computer-use
// ============================================================================

console.log(`TOOL 3: computer-use (ComputerUseHandler)\n`);
console.log(`Description: Browser automation and UI control`);
console.log(`Handler: ComputerUseHandler`);
console.log(`Usage Example:`);
console.log(`
  const result = await computerUse({
    action: "screenshot",
    coordinates: [100, 200]
  });
  // Returns: { screenshot: "base64...", text: "extracted text" }
  
  // Or click
  await computerUse({
    action: "click",
    coordinates: [500, 300]
  });
  
  // Or type
  await computerUse({
    action: "type",
    text: "search query"
  });
`);
console.log(`✅ Used by: Solutioning Agent, Implementation Agent\n`);

// ============================================================================
// TOOL 4: batch-submit
// ============================================================================

console.log(`TOOL 4: batch-submit (BatchProcessingHandler)\n`);
console.log(`Description: Submit batch jobs for async processing`);
console.log(`Handler: BatchProcessingHandler`);
console.log(`Usage Example:`);
console.log(`
  const jobId = await batchSubmit({
    requests: [
      { prompt: "Task 1", model: "gemini-2.5-flash" },
      { prompt: "Task 2", model: "gemini-2.5-flash" },
      { prompt: "Task 3", model: "gemini-2.5-flash" }
    ],
    displayName: "Batch Analysis"
  });
  // Returns: { jobId: "batch-123", status: "processing" }
  
  // Check status
  const status = await batchSubmit({ action: "getStatus", jobId });
  // Returns: { status: "completed", results: [...] }
`);
console.log(`✅ Used by: Implementation Agent`);
console.log(`💰 Cost Savings: 50% reduction in API calls\n`);

// ============================================================================
// TOOL 5: caching-tokens
// ============================================================================

console.log(`TOOL 5: caching-tokens (CachingTokensHandler)\n`);
console.log(`Description: Manage token caching and optimization`);
console.log(`Handler: CachingTokensHandler`);
console.log(`Usage Example:`);
console.log(`
  // Implicit caching
  const result = await cachingTokens({
    prompt: "Analyze requirements",
    systemPrompt: "You are an expert analyst",
    cacheControl: "ephemeral"
  });
  
  // Explicit caching
  const cached = await cachingTokens({
    action: "cache",
    content: "Large context document",
    ttl: 3600
  });
  // Returns: { cacheKey: "cache-123", tokensUsed: 5000, tokensSaved: 45000 }
`);
console.log(`✅ Used by: Implementation Agent`);
console.log(`💰 Cost Savings: 90% on repeated queries\n`);

// ============================================================================
// TOOL 6: long-context
// ============================================================================

console.log(`TOOL 6: long-context (LongContextHandler)\n`);
console.log(`Description: Process 1M+ token contexts`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const result = await longContext({
    content: "Very long document (1M+ tokens)",
    task: "Summarize key points",
    format: "markdown"
  });
  // Returns: { summary: "...", keyPoints: [...], tokensProcessed: 1000000 }
`);
console.log(`✅ Used by: Planning Agent, Implementation Agent\n`);

// ============================================================================
// TOOL 7: embeddings
// ============================================================================

console.log(`TOOL 7: embeddings (EmbeddingsRAGHandler)\n`);
console.log(`Description: Generate embeddings for semantic search`);
console.log(`Handler: EmbeddingsRAGHandler`);
console.log(`Usage Example:`);
console.log(`
  const embedding = await embeddings({
    text: "Find similar documents",
    model: "embedding-001"
  });
  // Returns: { embedding: [0.123, 0.456, ...], dimension: 768 }
  
  // Batch embeddings
  const batch = await embeddings({
    texts: ["text1", "text2", "text3"],
    action: "batch"
  });
  // Returns: { embeddings: [[...], [...], [...]] }
`);
console.log(`✅ Used by: Planning Agent\n`);

// ============================================================================
// TOOL 8: rag-retrieve
// ============================================================================

console.log(`TOOL 8: rag-retrieve (EmbeddingsRAGHandler)\n`);
console.log(`Description: Retrieve relevant documents via RAG`);
console.log(`Handler: EmbeddingsRAGHandler`);
console.log(`Usage Example:`);
console.log(`
  const results = await ragRetrieve({
    query: "How to implement caching?",
    topK: 5,
    threshold: 0.7
  });
  // Returns: { documents: [...], scores: [0.95, 0.87, ...] }
`);
console.log(`✅ Used by: Planning Agent\n`);

// ============================================================================
// TOOL 9: research
// ============================================================================

console.log(`TOOL 9: research (DeepResearchAgentHandler)\n`);
console.log(`Description: Execute multi-step autonomous research`);
console.log(`Handler: DeepResearchAgentHandler`);
console.log(`Usage Example:`);
console.log(`
  const research = await research({
    topic: "Best practices for API design",
    depth: "comprehensive",
    sources: ["web", "documentation", "examples"]
  });
  // Returns: { 
  //   findings: [...],
  //   sources: [...],
  //   synthesis: "...",
  //   confidence: 0.92
  // }
`);
console.log(`✅ Used by: Analysis Agent, Solutioning Agent\n`);

// ============================================================================
// TOOL 10: file-upload
// ============================================================================

console.log(`TOOL 10: file-upload (LongContextHandler)\n`);
console.log(`Description: Upload files for processing`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const uploaded = await fileUpload({
    filePath: "/path/to/file.pdf",
    mimeType: "application/pdf"
  });
  // Returns: { fileId: "file-123", size: 5242880, uploaded: true }
`);
console.log(`✅ Used by: Implementation Agent\n`);

// ============================================================================
// TOOL 11: file-list
// ============================================================================

console.log(`TOOL 11: file-list (LongContextHandler)\n`);
console.log(`Description: List uploaded files`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const files = await fileList({
    filter: "pdf",
    limit: 10
  });
  // Returns: { 
  //   files: [
  //     { id: "file-123", name: "doc.pdf", size: 5242880 },
  //     ...
  //   ],
  //   total: 42
  // }
`);
console.log(`✅ Used by: Implementation Agent\n`);

// ============================================================================
// TOOL 12: file-delete
// ============================================================================

console.log(`TOOL 12: file-delete (LongContextHandler)\n`);
console.log(`Description: Delete uploaded files`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const deleted = await fileDelete({
    fileId: "file-123"
  });
  // Returns: { deleted: true, fileId: "file-123" }
`);
console.log(`✅ Used by: Implementation Agent\n`);

// ============================================================================
// TOOL 13: pdf-process
// ============================================================================

console.log(`TOOL 13: pdf-process (LongContextHandler)\n`);
console.log(`Description: Process PDF files`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const processed = await pdfProcess({
    fileId: "file-123",
    action: "extract",
    format: "markdown"
  });
  // Returns: { 
  //   text: "extracted text...",
  //   pages: 42,
  //   images: 5,
  //   tables: 3
  // }
`);
console.log(`✅ Used by: Implementation Agent\n`);

// ============================================================================
// TOOL 14: video-process
// ============================================================================

console.log(`TOOL 14: video-process (LongContextHandler)\n`);
console.log(`Description: Process video files`);
console.log(`Handler: LongContextHandler`);
console.log(`Usage Example:`);
console.log(`
  const processed = await videoProcess({
    fileId: "file-456",
    action: "transcribe",
    language: "en"
  });
  // Returns: { 
  //   transcript: "...",
  //   duration: 3600,
  //   keyFrames: [...],
  //   summary: "..."
  // }
`);
console.log(`✅ Used by: Implementation Agent\n`);

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`${"=".repeat(80)}`);
console.log(`📊 TOOLS USAGE SUMMARY`);
console.log(`${"=".repeat(80)}\n`);

const toolsUsage = [
  { tool: "llm-call", handler: "LLMHandler", agents: 4, category: "LLM" },
  { tool: "function-call", handler: "FunctionCallingHandler", agents: 2, category: "Functions" },
  { tool: "computer-use", handler: "ComputerUseHandler", agents: 2, category: "Automation" },
  { tool: "batch-submit", handler: "BatchProcessingHandler", agents: 1, category: "Batch" },
  { tool: "caching-tokens", handler: "CachingTokensHandler", agents: 1, category: "Optimization" },
  { tool: "long-context", handler: "LongContextHandler", agents: 2, category: "Context" },
  { tool: "embeddings", handler: "EmbeddingsRAGHandler", agents: 1, category: "RAG" },
  { tool: "rag-retrieve", handler: "EmbeddingsRAGHandler", agents: 1, category: "RAG" },
  { tool: "research", handler: "DeepResearchAgentHandler", agents: 2, category: "Research" },
  { tool: "file-upload", handler: "LongContextHandler", agents: 1, category: "Files" },
  { tool: "file-list", handler: "LongContextHandler", agents: 1, category: "Files" },
  { tool: "file-delete", handler: "LongContextHandler", agents: 1, category: "Files" },
  { tool: "pdf-process", handler: "LongContextHandler", agents: 1, category: "Media" },
  { tool: "video-process", handler: "LongContextHandler", agents: 1, category: "Media" },
];

console.log(`Total Tools: ${toolsUsage.length}`);
console.log(`Total Handlers: 9`);
console.log(`Total Agents with Access: 4 standard + 24 custom modes\n`);

console.log(`Tools by Category:\n`);
const categories = {};
toolsUsage.forEach((item) => {
  if (!categories[item.category]) {
    categories[item.category] = [];
  }
  categories[item.category].push(item.tool);
});

Object.entries(categories).forEach(([category, tools]) => {
  console.log(`   ${category}: ${tools.join(", ")}`);
});

console.log(`\n${"=".repeat(80)}`);
console.log(`🎯 HOW TO USE THESE TOOLS`);
console.log(`${"=".repeat(80)}\n`);

console.log(`1. VIA AGENTS`);
console.log(`   • Select agent from catalog`);
console.log(`   • Agent automatically uses appropriate tools`);
console.log(`   • Example: Analysis Agent uses llm-call + function-call + research\n`);

console.log(`2. VIA API ENDPOINT`);
console.log(`   curl http://127.0.0.1:3457/api/mcp/tools\n`);

console.log(`3. VIA DASHBOARD`);
console.log(`   • Go to http://127.0.0.1:3457`);
console.log(`   • Select agent in Catalog`);
console.log(`   • View tools in Agent Detail`);
console.log(`   • Test tools in Playground\n`);

console.log(`4. VIA SCRIPTS`);
console.log(`   node scripts/demo-agent-task.mjs api_key agent_name "task"`);
console.log(`   node scripts/example-real-task.mjs api_key\n`);

console.log(`5. VIA IDE INTEGRATION`);
console.log(`   • IDE calls GET /api/mcp/tools`);
console.log(`   • IDE displays available tools`);
console.log(`   • User selects tools for task\n`);

console.log(`${"=".repeat(80)}`);
console.log(`✅ ALL 14 TOOLS READY TO USE`);
console.log(`${"=".repeat(80)}\n`);

console.log(`🚀 Next Steps:`);
console.log(`   1. Start server: npm run dev`);
console.log(`   2. Open dashboard: http://127.0.0.1:3457`);
console.log(`   3. Select agent and tools`);
console.log(`   4. Submit task in Playground`);
console.log(`   5. See results with tool execution details\n`);

console.log(`💡 Tips:`);
console.log(`   • Use batch-submit for multiple tasks (50% cost savings)`);
console.log(`   • Use caching-tokens for repeated queries (90% savings)`);
console.log(`   • Use long-context for large documents (1M+ tokens)`);
console.log(`   • Use embeddings + rag-retrieve for semantic search`);
console.log(`   • Use computer-use for UI automation\n`);

console.log(`\n`);
