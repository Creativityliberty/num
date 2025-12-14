# Num Agent Spec v1

> Official specification for Num Agents Platform

## Overview

**Num Agents** is a production-ready platform for orchestrating AI agents with:
- Flow-based execution (DAG)
- Multi-agent collaboration (serial, parallel, consensus)
- Model/budget/rate-limit controls per agent/node
- Multi-tenant isolation with quotas
- Signed pack distribution (marketplace)
- IDE-agnostic via MCP protocol

---

## 1. Core Concepts

### 1.1 Num Agent

A **Num Agent** is an executable unit defined by:
- **Mode**: Configuration (id, name, tags, routing, runtimePolicy)
- **Flow**: Execution graph (nodes + edges)

```json
{
  "id": "num:code-fix",
  "name": "Num Code Fix",
  "description": "Analyze, fix and review code issues",
  "tags": ["code", "bugfix"],
  "runtimePolicy": {
    "model": {
      "preferred": { "provider": "openai", "model": "gpt-4.1" },
      "fallbacks": [{ "provider": "openai", "model": "gpt-4.1-mini" }]
    },
    "budget": { "maxCostUsd": 3 }
  },
  "flow": {
    "version": "1",
    "nodes": [...],
    "edges": [...]
  }
}
```

### 1.2 Flow Node

Each node in a flow represents one agent step:

```json
{
  "id": "plan",
  "role": "planner",
  "goal": "Analyze the issue and propose solutions",
  "expectedSchema": "multiPlan",
  "runtimePolicy": {
    "model": { "preferred": { "provider": "openai", "model": "gpt-4.1" } }
  },
  "prompt": {
    "system": "You are a senior software architect.",
    "user": "Analyze: {{task.goal}}"
  }
}
```

**Roles**: `planner`, `implementer`, `reviewer`, `security`, `arbiter`

**Expected Schemas**: `multiPlan`, `patchCandidate`, `reviewReport`, `securityReport`, `mergeDecision`

### 1.3 Flow Edge

Edges define dependencies between nodes:

```json
{ "from": "plan", "to": "implement", "kind": "dependsOn" }
```

---

## 2. Sources

Num Agents can be loaded from 3 sources:

### 2.1 FILE (`modes/*.json`)

Individual mode files:
```
modes/
├── code-fix.json
└── security-scan.json
```

### 2.2 CATALOG (`catalog.json`)

Large file with multiple agents:
```json
{
  "version": "1",
  "namespace": "num",
  "agents": [
    { "id": "code-fix", "name": "...", "flow": {...} },
    { "id": "security-scan", "name": "...", "flow": {...} }
  ]
}
```
→ Mode IDs: `num:code-fix`, `num:security-scan`

### 2.3 REPO (Packs)

Structured directory:
```
agents_repo/
└── num-core/
    ├── pack.json
    └── modes/
        ├── code-fix.json
        └── security-scan.json
```

**pack.json**:
```json
{
  "id": "num-core",
  "name": "Num Core Agents",
  "version": "1.0.0",
  "runtimePolicy": { "budget": { "maxCostUsd": 100 } }
}
```

---

## 3. Runtime Policy

Controls model selection, budgets, and rate limits.

### 3.1 Priority (inheritance)

```
node > mode > pack > server defaults
```

### 3.2 Schema

```typescript
interface AgentRuntimePolicy {
  model?: {
    preferred?: { provider: string; model: string };
    fallbacks?: { provider: string; model: string }[];
  };
  budget?: {
    maxTokens?: number;
    maxCostUsd?: number;
  };
  rateLimit?: {
    rpm?: number;  // requests per minute
    tpm?: number;  // tokens per minute
  };
}
```

---

## 4. Multi-Tenant

### 4.1 Tenant

```typescript
interface Tenant {
  id: string;
  name: string;
  quotas: {
    maxRunsPerDay: number;
    maxCostUsdPerDay: number;
  };
}
```

### 4.2 Project

```typescript
interface Project {
  id: string;
  tenantId: string;
  name: string;
}
```

### 4.3 Isolation

```
.mcp/tenants/
├── acme/
│   ├── runs/
│   ├── packs/
│   └── feedback.jsonl
└── globex/
```

---

## 5. Auth & RBAC

### 5.1 Roles

| Role | Permissions |
|------|-------------|
| `admin` | All permissions |
| `developer` | modes.*, packs.*, orchestrate.run, pipeline.apply |
| `viewer` | modes.read |

### 5.2 JWT Auth

```
Authorization: Bearer <token>
```

Payload:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "developer",
  "tenantId": "acme"
}
```

---

## 6. MCP Protocol

### 6.1 Tools

| Tool | Description |
|------|-------------|
| `agents.plan` | Start a new run with a task |
| `agents.next` | Get next job to execute |
| `agents.submit` | Submit job result |
| `modes.list` | List available modes |
| `modes.get` | Get mode details |
| `modes.suggest` | Suggest modes for a task |
| `pack.export` | Export pack to bundle |
| `pack.import` | Import pack from bundle |

### 6.2 HTTP Transport

```
POST /mcp/call
{
  "tool": "agents.plan",
  "input": { "task": { "goal": "Fix bug X" }, "modeId": "num:code-fix" }
}
```

---

## 7. Marketplace

### 7.1 Signed Packs

```json
{
  "bundle": { ... },
  "signature": "base64(rsa-sha256)",
  "publisherId": "num-official"
}
```

### 7.2 Trust Policy

```json
{
  "allowUnsigned": false,
  "allowUntrusted": true,
  "trustedPublishers": [
    { "id": "num-official", "name": "Num Official", "publicKey": "...", "trusted": true }
  ]
}
```

---

## 8. Feedback Loop

### 8.1 Feedback Record

```typescript
interface ModeFeedback {
  modeId: string;
  runId: string;
  success: boolean;
  costUsd?: number;
  durationMs?: number;
  rolledBack?: boolean;
  ts: string;
}
```

### 8.2 Mode Stats

Computed from feedback:
- `successRate`
- `rollbackRate`
- `avgCostUsd`
- `avgDurationMs`

Used to adjust routing scores.

---

## 9. Example: Complete Agent

```json
{
  "id": "num:code-fix",
  "name": "Num Code Fix",
  "description": "Analyze, fix and review code issues",
  "tags": ["code", "bugfix", "typescript"],
  "runtimePolicy": {
    "model": {
      "preferred": { "provider": "openai", "model": "gpt-4.1" },
      "fallbacks": [{ "provider": "openai", "model": "gpt-4.1-mini" }]
    },
    "budget": { "maxCostUsd": 5, "maxTokens": 100000 }
  },
  "flow": {
    "version": "1",
    "nodes": [
      {
        "id": "plan",
        "role": "planner",
        "goal": "Analyze the issue",
        "expectedSchema": "multiPlan",
        "prompt": {
          "system": "You are a senior software architect.",
          "user": "Analyze: {{task.goal}}"
        }
      },
      {
        "id": "implement",
        "role": "implementer",
        "goal": "Implement the fix",
        "expectedSchema": "patchCandidate",
        "runtimePolicy": {
          "model": { "preferred": { "provider": "openai", "model": "gpt-4.1" } }
        },
        "prompt": {
          "system": "You are a precise software engineer.",
          "user": "Implement the selected solution."
        }
      },
      {
        "id": "review",
        "role": "reviewer",
        "goal": "Review the patch",
        "expectedSchema": "reviewReport",
        "runtimePolicy": {
          "model": { "preferred": { "provider": "openai", "model": "gpt-4.1-mini" } }
        },
        "prompt": {
          "system": "You are a strict code reviewer.",
          "user": "Review the patch for correctness and style."
        }
      }
    ],
    "edges": [
      { "from": "plan", "to": "implement" },
      { "from": "implement", "to": "review" }
    ]
  }
}
```

---

## 10. Quick Start

```typescript
import { ModesRegistry } from "num-agents";

// Load modes from all sources
const registry = new ModesRegistry({
  modesPath: "./modes",
  catalogPath: "./catalog.json",
  repoPath: "./agents_repo",
});

// List modes
const modes = await registry.list();

// Get mode details
const mode = await registry.get("num:code-fix");

// Validate mode
const validation = await registry.validate("num:code-fix");

// Simulate execution
const simulation = await registry.simulate("num:code-fix");
```

---

## License

MIT
