# Quickstart (Num Agents Platform)

## 1. Start the Server (HTTP mode)

```bash
# Build
npm run build

# Start with HTTP transport
node dist/cli.js serve \
  --modes-path ./modes \
  --policy ./policy.json \
  --http \
  --port 3001 \
  --require-auth
```

## 2. Set Environment Variables

```bash
# Server auth token
export NUM_TOKEN="your-jwt-token"

# LLM API keys (for client)
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

## 3. Verify Server

```bash
# Health check
curl http://localhost:3001/health

# List tools
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools

# Get OpenAPI spec
curl http://localhost:3001/openapi.json | head -50
```

## 4. Configure Cursor (Optional)

Copy the example config:
```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Restart Cursor to see the tools.

## 5. Configure Client

Copy the example config:
```bash
cp .num-agents/config.example.json .num-agents/config.json
```

## 6. Run via CLI

```bash
cd packages/client
npm run build

# List tools
node dist/cli.js tools

# Run orchestration
node dist/cli.js run \
  --mode num:code-fix \
  --goal "Fix failing test in auth module" \
  --auto-apply false
```

## 7. Run via API

```typescript
import { McpHttpClient, runMultiAgentsSerial, OpenAIAdapter } from "@mcp-agents-modes/client";

const mcp = new McpHttpClient({
  baseUrl: "http://localhost:3001",
  token: process.env.NUM_TOKEN,
});

const result = await runMultiAgentsSerial({
  mcp,
  adapters: {
    planner: new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4.1-mini" }),
    implementer: new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4.1" }),
    reviewer: new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4.1-mini" }),
    security: new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4.1-mini" }),
  },
  task: { goal: "Fix failing test X" },
  modeId: "num:code-fix",
  autoApply: false,
});

console.log(result);
```

## Available Num Agents

| Agent | Description |
|-------|-------------|
| `num:code-fix` | Fix bugs with plan→implement→review |
| `num:security-scan` | Security vulnerability scanner |
| `num:docs-writer` | Generate documentation |
| `num:test-generator` | Generate unit tests |
| `num:refactor` | Refactor code for quality |
| `num:ci-helper` | Fix CI/CD failures |
| `num:api-review` | Review API design + security |
| `num:perf-check` | Performance analysis |
| `num:dependency-update` | Update dependencies safely |
| `num:infra-audit` | Audit infrastructure configs |

## Troubleshooting

### Connection refused
- Ensure server is running: `curl http://localhost:3001/health`

### UNAUTHENTICATED
- Check `NUM_TOKEN` is set and valid

### FORBIDDEN
- User role lacks permission for the tool

### Tool not found
- Verify mode exists: `curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools`
