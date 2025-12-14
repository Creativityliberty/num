# MCP Access Summary — Num Agents v3.0 Complete

## 🎯 What the MCP Provides Access To

### **1. AGENTS (28 Total)**

#### Standard Agents (4)
- `analysis-agent` — Analyze requirements and context
- `planning-agent` — Create detailed plans with context awareness
- `solutioning-agent` — Design solutions with research and tools
- `implementation-agent` — Execute implementation with batch processing

#### Custom Modes (24)
- `research-analyst` — Research and analysis
- `data-scientist` — Data science and ML
- `code-reviewer` — Code review and quality
- `documentation-writer` — Technical documentation
- `security-auditor` — Security analysis
- `performance-optimizer` — Performance tuning
- `api-designer` — API design and architecture
- `database-architect` — Database design
- `devops-engineer` — DevOps and infrastructure
- `qa-specialist` — Quality assurance
- `project-manager` — Project management
- `business-analyst` — Business analysis
- `ux-designer` — UX/UI design
- `frontend-developer` — Frontend development
- `backend-developer` — Backend development
- `mobile-developer` — Mobile development
- `ml-engineer` — Machine learning
- `data-engineer` — Data engineering
- `cloud-architect` — Cloud architecture
- `security-engineer` — Security engineering
- `sre-engineer` — Site reliability
- `technical-writer` — Technical writing
- `solutions-architect` — Solutions architecture
- `product-manager` — Product management

---

### **2. GEMINI API HANDLERS (9 Total)**

#### LLMHandler
- **Access**: Multi-provider LLM support (Gemini, OpenAI, Anthropic, Local)
- **Features**:
  - Dynamic model selection
  - Temperature and token control
  - Streaming support
  - Cost calculation per request
- **Models Available**:
  - gemini-2.5-flash (fast, cost-effective)
  - gemini-2.5-pro (powerful)
  - gemini-3-pro-preview (latest)

#### FunctionCallingHandler
- **Access**: Function calling orchestration
- **Features**:
  - Function registry management
  - Tool execution
  - Automatic retry logic
  - Error handling

#### ComputerUseHandler
- **Access**: Browser automation & UI control
- **Features**:
  - Coordinate normalization
  - UI action execution
  - Safety validation
  - Screenshot capture

#### BatchProcessingHandler
- **Access**: Async batch job management
- **Features**:
  - Job lifecycle management
  - 50% cost reduction
  - Files API integration
  - Status tracking

#### CachingTokensHandler
- **Access**: Context caching & token management
- **Features**:
  - Implicit caching (automatic)
  - Explicit caching (manual)
  - 90% cost reduction
  - Token counting across modalities

#### LongContextHandler
- **Access**: 1M+ token context support
- **Features**:
  - PDF processing
  - Video processing
  - Audio processing
  - Token validation
  - Context window management

#### EmbeddingsRAGHandler
- **Access**: Embeddings & RAG system
- **Features**:
  - Semantic search
  - Document retrieval
  - Similarity calculation
  - Vector indexing

#### DeepResearchAgentHandler
- **Access**: Multi-step autonomous research
- **Features**:
  - Background execution
  - Streaming support
  - Research planning
  - Synthesis

#### GeminiConfigManager
- **Access**: Configuration management
- **Features**:
  - API key management
  - Model definitions
  - Cost calculation
  - Configuration validation

---

### **3. NUMFLOW ORCHESTRATION (4 Phases)**

#### Phase 1: Analysis
- **Agent**: analysis-agent
- **Handlers**: Config, LLM, FunctionCalling
- **Purpose**: Analyze requirements and context

#### Phase 2: Planning
- **Agent**: planning-agent
- **Handlers**: LLM, LongContext, EmbeddingsRAG
- **Purpose**: Create detailed plan with context awareness

#### Phase 3: Solutioning
- **Agent**: solutioning-agent
- **Handlers**: LLM, FunctionCalling, ComputerUse, DeepResearch
- **Purpose**: Design solution with research and tools

#### Phase 4: Implementation
- **Agent**: implementation-agent
- **Handlers**: LLM, BatchProcessing, CachingTokens, ComputerUse
- **Purpose**: Execute implementation with batch processing

---

### **4. DASHBOARD PAGES (9 Total)**

#### Existing Pages
1. **Catalog** (`/catalog`)
   - Browse all 75 agents (51 catalog + 24 custom)
   - View agent details
   - Filter by tags and categories

2. **Custom Modes** (`/custom-modes`)
   - Manage custom mode definitions
   - View YAML configurations
   - Statistics and breakdown

3. **Agent Detail** (`/agent-detail`)
   - View agent specifications
   - Role definition and instructions
   - Tools and capabilities
   - When to use guidance

4. **Editor** (`/editor`)
   - Create and edit agent modes
   - YAML editor
   - Validation and testing

5. **Playground** (`/playground`)
   - Test agents with prompts
   - Simulate execution
   - View results and metrics

6. **Scoring** (`/scoring`)
   - Evaluate agent performance
   - Compare agents
   - Suggest best agents for tasks

7. **Model Health** (`/model-health`)
   - Monitor model performance
   - View health reports
   - Suggest fallbacks

#### New Pages (HIGH PRIORITY)
8. **Gemini Handlers** (`/gemini-handlers`)
   - Manage Gemini API handlers
   - Configure API key
   - View handler status
   - Handler statistics

9. **Flow Visualizer** (`/flow-visualizer`)
   - Visualize NumFlow 4 phases
   - Monitor phase execution
   - View handler usage per phase
   - Flow control (Start, Pause, Reset)

---

### **5. API ENDPOINTS (15 Total)**

#### Dashboard Endpoints
- `GET /` — Main dashboard
- `GET /catalog` — Agent catalog page
- `GET /custom-modes` — Custom modes page
- `GET /agent-detail` — Agent detail page
- `GET /editor` — Agent editor page
- `GET /playground` — Playground page
- `GET /scoring` — Scoring page
- `GET /model-health` — Model health page

#### New UI Endpoints
- `GET /gemini-handlers` — Gemini handlers page
- `GET /flow-visualizer` — Flow visualizer page
- `GET /api/components/handler-selector` — Handler selector component

#### API Endpoints
- `GET /api/catalog` — List all agents
- `GET /api/custom-modes` — List custom modes
- `GET /api/mcp/tools` — List MCP tools
- `GET /api/catalog/mode/:id` — Get agent details
- `GET /api/gemini/handlers` — List Gemini handlers
- `GET /api/gemini/config` — Get Gemini config
- `GET /api/flow/status` — Get flow status
- `GET /api/flow/test` — Test flow execution
- `POST /api/playground/validate` — Validate agent
- `POST /api/playground/simulate` — Simulate agent
- `POST /api/packops/validate-simulate-all` — Batch validation

---

### **6. TOOLS & CAPABILITIES (14 Total)**

#### MCP Tools
1. **LLM Call** — Call LLM with prompt and schema
2. **Function Call** — Execute registered functions
3. **Computer Use** — Browser automation actions
4. **Batch Submit** — Submit batch jobs
5. **Cache Management** — Manage context caches
6. **Token Counter** — Count tokens
7. **Embeddings** — Generate embeddings
8. **RAG Retrieve** — Retrieve documents
9. **Research** — Execute research tasks
10. **File Upload** — Upload files to Files API
11. **File List** — List uploaded files
12. **File Delete** — Delete files
13. **PDF Process** — Process PDF documents
14. **Video Process** — Process video files

---

### **7. CONFIGURATION & SETTINGS**

#### mcp.json Configuration
```json
{
  "mcpServers": {
    "num-agents": {
      "command": "node",
      "args": ["dist/src/cli.js", "serve", ...],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}",
        "LOG_LEVEL": "info"
      }
    }
  },
  "apiEndpoints": {
    "dashboard": "http://127.0.0.1:3457",
    "catalog": "http://127.0.0.1:3457/api/catalog",
    "geminiHandlers": "http://127.0.0.1:3457/api/gemini/handlers",
    "flowStatus": "http://127.0.0.1:3457/api/flow/status"
  },
  "geminiHandlers": {
    "llm": "LLMHandler",
    "functionCalling": "FunctionCallingHandler",
    "computerUse": "ComputerUseHandler",
    "batchProcessing": "BatchProcessingHandler",
    "cachingTokens": "CachingTokensHandler",
    "longContext": "LongContextHandler",
    "embeddingsRag": "EmbeddingsRAGHandler",
    "deepResearch": "DeepResearchAgentHandler",
    "config": "GeminiConfigManager"
  },
  "flowIntegration": {
    "enabled": true,
    "handlers": 9,
    "agents": 28,
    "coverage": "100%"
  }
}
```

---

### **8. TESTING & VALIDATION**

#### Test Scripts Available
- `test-system.mjs` — System integration test (all agents + handlers)
- `test-custom-modes.mjs` — Custom modes integration test
- `test-flow-gemini.mjs` — NumFlow with Gemini handlers test
- `test-mcp-local.mjs` — MCP local server test

#### Test Coverage
- ✅ 28/28 agents have full handler access
- ✅ 9/9 handlers integrated and tested
- ✅ 4/4 NumFlow phases validated
- ✅ 100% handler coverage across all agents

---

### **9. COST OPTIMIZATION FEATURES**

#### Batch Processing
- 50% cost reduction for batch jobs
- Async processing
- Job management and tracking

#### Context Caching
- 90% cost reduction for cached content
- Implicit caching (automatic)
- Explicit caching (manual control)

#### Token Management
- Token counting across modalities
- Cost calculation per request
- Budget tracking

#### Model Selection
- Dynamic model selection
- Cost-based optimization
- Performance vs cost tradeoff

---

### **10. SECURITY & MANAGEMENT**

#### API Key Management
- Centralized Gemini API key configuration
- Environment variable support
- Secure storage in localStorage (client-side)

#### Access Control
- Agent-based access control
- Handler-level permissions
- Role-based access (RBAC)

#### Audit Logging
- Tool execution logging
- Event tracking
- Performance metrics

---

## 📊 Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Agents** | 28 | ✅ All ready |
| **Handlers** | 9 | ✅ All active |
| **Pages** | 9 | ✅ All available |
| **API Endpoints** | 15+ | ✅ All configured |
| **Tools** | 14 | ✅ All integrated |
| **NumFlow Phases** | 4 | ✅ All operational |
| **Custom Modes** | 24 | ✅ All loaded |
| **Handler Coverage** | 100% | ✅ Complete |

---

## 🚀 Getting Started

### Start MCP Server
```bash
export GEMINI_API_KEY=your_api_key_here
npm run dev
```

### Access Dashboard
```
http://127.0.0.1:3457
```

### Test System
```bash
node scripts/test-system.mjs your_api_key_here
```

---

## 📋 What You Can Do With MCP

1. **Run Agents** — Execute any of 28 agents with full Gemini API support
2. **Orchestrate Flows** — Execute NumFlow 4-phase orchestration
3. **Use Handlers** — Access all 9 Gemini API handlers
4. **Manage Tools** — Execute 14 integrated tools
5. **Optimize Costs** — Use batch processing and caching for 50-90% savings
6. **Monitor Performance** — Track metrics and health
7. **Customize Agents** — Create and edit custom modes
8. **Visualize Flows** — See real-time flow execution
9. **Manage Handlers** — Configure and monitor Gemini handlers
10. **Test & Validate** — Run comprehensive system tests

---

**Num Agents v3.0 — PRODUCTION-READY with Complete MCP Integration**
