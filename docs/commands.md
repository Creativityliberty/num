# Commandes Num Agents Platform

## 🚀 Démarrage Rapide

### 1. Build
```bash
npm run build
```

### 2. Démarrer le Serveur

#### Mode stdio (local, pour IDE)
```bash
node dist/src/cli.js serve --modes-path ./examples/num-agents/num-core/modes
```

#### Mode HTTP (remote, pour API)
```bash
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001
```

#### Mode HTTP + Auth
```bash
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001 \
  --require-auth
```

#### Mode HTTP + Dashboard
```bash
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001 \
  --dashboard \
  --dashboard-port 3002
```

#### Mode Complet (HTTP + Auth + Dashboard)
```bash
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001 \
  --require-auth \
  --dashboard \
  --dashboard-port 3002
```

---

## 🔧 Variables d'Environnement

```bash
# Token JWT pour auth (si --require-auth)
export NUM_TOKEN="your-jwt-token"

# Clés API LLM (pour le client)
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 🌐 Endpoints API

### Serveur MCP HTTP (port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mcp/tools` | GET | Liste des tools avec metadata |
| `/mcp/tools/:name` | GET | Détail d'un tool |
| `/mcp/call` | POST | Appeler un tool |
| `/openapi.json` | GET | Spec OpenAPI 3.0 |

### Dashboard (port 3002)

| URL | Description |
|-----|-------------|
| `http://localhost:3002` | Dashboard principal |
| `/api/health` | Health check API |
| `/api/runs` | Liste des runs |
| `/api/runs/:id` | Détail d'un run |
| `/api/modes` | Liste des modes |
| `/api/policy` | Policy actuelle |

---

## 🧪 Tests

```bash
# Tous les tests
npm test

# Typecheck
npm run typecheck

# Tests avec watch
npm run dev
```

---

## 📡 Tester les Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Liste des tools
curl http://localhost:3001/mcp/tools

# Avec auth
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools

# Appeler un tool
curl -X POST http://localhost:3001/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool":"modes.list","input":{}}'

# OpenAPI spec
curl http://localhost:3001/openapi.json | head -50

# Dashboard health
curl http://localhost:3002/api/health
```

---

## 🖥️ CLI Client

```bash
cd packages/client
npm run build

# Liste des tools
node dist/cli.js tools

# Exécuter un agent
node dist/cli.js run --goal "Fix failing test X" --mode num:code-fix

# Multi-agents
node dist/cli.js run --multi --goal "Implement feature Y" --auto-apply false
```

---

## 📁 Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `.cursor/mcp.json` | Config Cursor IDE |
| `.num-agents/config.json` | Config client CLI |
| `policy.json` | Policy de sécurité |

### Créer les configs
```bash
cp .cursor/mcp.json.example .cursor/mcp.json
cp .num-agents/config.example.json .num-agents/config.json
```

---

## 🔒 Policy

Créer un fichier `policy.json` :
```json
{
  "workspaceRoot": ".",
  "allowWrite": true,
  "allowExec": true,
  "allowGit": true,
  "allowedCommands": ["npm", "node", "git"],
  "exec": {
    "allowedExecutables": ["npm", "node", "git"],
    "allowedArgs": {}
  }
}
```

Utiliser avec :
```bash
node dist/src/cli.js serve \
  --modes-path ./modes \
  --policy ./policy.json \
  --http --port 3001
```
