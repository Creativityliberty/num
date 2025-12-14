# Claude (Anthropic) + Num Agents

This guide covers using Claude models with the Num Agents platform.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Client Runner  │────▶│  MCP Server      │────▶│  Modes/Agents   │
│  (Claude/OpenAI)│     │  (HTTP or stdio) │     │  Registry       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 1. Configuration

Create `.num-agents/config.json`:

```json
{
  "transport": {
    "type": "http",
    "baseUrl": "http://localhost:3001",
    "tokenEnv": "NUM_TOKEN"
  },
  "models": {
    "planner": { "provider": "anthropic", "model": "claude-3-5-sonnet-latest" },
    "implementer": { "provider": "openai", "model": "gpt-4.1" },
    "reviewer": { "provider": "anthropic", "model": "claude-3-5-sonnet-latest" },
    "security": { "provider": "anthropic", "model": "claude-3-5-sonnet-latest" }
  }
}
```

## 2. Environment Variables

```bash
# MCP Server auth (if using HTTP transport)
export NUM_TOKEN="your-jwt-token"

# LLM API keys
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

## 3. Running

### Using CLI
```bash
# List available tools
num-agents tools

# Run with a specific mode
num-agents run --mode num:code-fix --goal "Fix failing test X" --auto-apply false

# Run with multi-agent orchestration
num-agents run --multi --mode num:code-fix --goal "Implement feature Y"
```

### Using API
```typescript
import { McpHttpClient, runMultiAgentsSerial, AnthropicAdapter, OpenAIAdapter } from "@mcp-agents-modes/client";

const mcp = new McpHttpClient({
  baseUrl: "http://localhost:3001",
  token: process.env.NUM_TOKEN,
});

const result = await runMultiAgentsSerial({
  mcp,
  adapters: {
    planner: new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-latest" }),
    implementer: new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4.1" }),
    reviewer: new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-latest" }),
    security: new AnthropicAdapter({ apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-latest" }),
  },
  task: { goal: "Fix bug in authentication module" },
  modeId: "num:code-fix",
  autoApply: false,
});
```

## 4. Model Selection

The platform supports per-step model selection via `runtimePolicy`:

```json
{
  "runtimePolicy": {
    "model": {
      "preferred": { "provider": "anthropic", "model": "claude-3-5-sonnet-latest" },
      "fallbacks": [{ "provider": "openai", "model": "gpt-4.1-mini" }]
    },
    "budget": { "maxCostUsd": 5 }
  }
}
```

## 5. Policy Gating

If the server policy blocks certain actions (apply/exec/commit), the runner stops with status `"manual"` and a clear message:

```json
{
  "status": "manual",
  "message": "Ready to apply. Use pipeline.applyAndVerify then git tools as allowed by policy.",
  "suggestedTools": ["pipeline.applyAndVerify", "git.branch.create", "git.commit"]
}
```

## 6. Debugging

Enable verbose logging:
```bash
num-agents run --mode num:code-fix --goal "..." 2>&1 | tee run.log
```

Check server logs:
```bash
tail -f .mcp/events.jsonl
```
