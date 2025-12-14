# Intégration MCP — Cursor, Claude, etc.

## 🚀 Démarrage Rapide

### Prérequis
```bash
# Build le projet
npm run build

# Démarrer le serveur MCP
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001 \
  --dashboard \
  --dashboard-port 3002
```

---

## 🔵 Cursor IDE

### Configuration HTTP

**Fichier:** `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "num-agents": {
      "url": "http://localhost:3001",
      "type": "http",
      "headers": {
        "Authorization": "Bearer ${NUM_TOKEN}"
      }
    }
  }
}
```

### Setup

1. **Copier la config**
```bash
cp .cursor/mcp.json ~/.cursor/mcp.json
```

2. **Définir le token (optionnel)**
```bash
export NUM_TOKEN="your-jwt-token"
```

3. **Redémarrer Cursor**

### Utilisation dans Cursor

Cursor détectera automatiquement les tools MCP :

```
@modes.list — Liste tous les modes disponibles
@modes.plan — Générer un plan pour une tâche
@orchestrate.run — Lancer un agent
@workspace.applyPatch — Appliquer un patch
@git.commit — Committer les changements
@runs.telemetry.append — Enregistrer la telemetry
```

**Exemple:**
```
@modes.list query="code fix"
```

---

## 🟣 Claude Desktop

### Configuration stdio

**Fichier:** `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "num-agents": {
      "command": "node",
      "args": [
        "/path/to/Numtema-mcp-agents-modes/dist/src/cli.js",
        "serve",
        "--modes-path",
        "/path/to/Numtema-mcp-agents-modes/examples/num-agents/num-core/modes",
        "--dashboard",
        "--dashboard-port",
        "3002"
      ],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Setup

1. **Créer le répertoire**
```bash
mkdir -p ~/.claude
```

2. **Copier la config**
```bash
cp .claude/claude_desktop_config.json ~/.claude/claude_desktop_config.json
```

3. **Éditer les chemins absolus**
```bash
# Remplacer /path/to/Numtema-mcp-agents-modes par le chemin réel
sed -i 's|/path/to/Numtema-mcp-agents-modes|'$(pwd)'|g' ~/.claude/claude_desktop_config.json
```

4. **Redémarrer Claude Desktop**

### Utilisation dans Claude

Claude détectera automatiquement les tools MCP :

```
Use the num-agents MCP to list available modes
Use the num-agents MCP to plan a code fix
Use the num-agents MCP to run an agent
```

---

## 🌐 Autres Plateformes

### Windsurf (Codeium)

Windsurf supporte aussi les MCP HTTP :

```json
{
  "mcpServers": {
    "num-agents": {
      "url": "http://localhost:3001",
      "type": "http"
    }
  }
}
```

**Fichier:** `~/.windsurf/mcp.json`

### Zed Editor

```json
{
  "mcp_servers": {
    "num-agents": {
      "command": "node",
      "args": [
        "dist/src/cli.js",
        "serve",
        "--modes-path",
        "./examples/num-agents/num-core/modes"
      ]
    }
  }
}
```

---

## 🔐 Authentification

### JWT Token (optionnel)

Si tu veux activer l'auth :

```bash
# Démarrer le serveur avec auth
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http \
  --port 3001 \
  --require-auth

# Générer un token
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 'user-1', role: 'admin' }, 'secret-key');
console.log(token);
"

# Exporter le token
export NUM_TOKEN="eyJhbGc..."
```

---

## 📊 Dashboard

Accès au dashboard depuis n'importe quelle plateforme :

```
http://localhost:3002
```

**Sections disponibles:**
- Events live (WebSocket)
- Runs management
- Modes registry
- Packs
- Telemetry (19.3)

---

## 🧪 Test des Tools

### Via curl

```bash
# List modes
curl http://localhost:3001/mcp/call \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"tool":"modes.list","input":{}}'

# Plan
curl http://localhost:3001/mcp/call \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "tool":"modes.plan",
    "input":{
      "goal":"Fix failing test",
      "modeId":"code-fix"
    }
  }'

# Run orchestrate
curl http://localhost:3001/mcp/call \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "tool":"orchestrate.run",
    "input":{
      "goal":"Implement feature X",
      "modeId":"code-fix"
    }
  }'
```

---

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Vérifier que le serveur tourne
curl http://localhost:3001/health
```

### "Tool not found"
```bash
# Vérifier les tools disponibles
curl http://localhost:3001/mcp/tools
```

### "Authorization failed"
```bash
# Vérifier le token
echo $NUM_TOKEN

# Générer un nouveau token
export NUM_TOKEN="new-token"
```

### Modes not loading
```bash
# Vérifier le chemin des modes
ls examples/num-agents/num-core/modes/

# Vérifier les logs
tail -f ~/.cursor/logs/mcp.log
```

---

## 📝 Cas d'Usage

### Cas 1: Fixer un bug avec Cursor
```
@modes.list query="fix"
@modes.plan goal="Fix bug in authentication" modeId="code-fix"
@orchestrate.run goal="Fix bug in authentication" modeId="code-fix"
```

### Cas 2: Générer des tests avec Claude
```
Use num-agents to list modes
Use num-agents to plan test generation
Use num-agents to run test-generator mode
```

### Cas 3: Audit de sécurité
```
@modes.list query="security"
@orchestrate.run goal="Security audit" modeId="security-scan"
```

---

## 🔄 Workflow Complet

1. **Démarrer le serveur**
```bash
npm run build
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http --port 3001 \
  --dashboard --dashboard-port 3002
```

2. **Configurer Cursor/Claude**
```bash
cp .cursor/mcp.json ~/.cursor/mcp.json
# ou
cp .claude/claude_desktop_config.json ~/.claude/claude_desktop_config.json
```

3. **Redémarrer l'IDE**

4. **Utiliser les tools MCP**
```
@modes.list
@modes.plan goal="..." modeId="..."
@orchestrate.run goal="..." modeId="..."
```

5. **Voir les résultats dans le dashboard**
```
http://localhost:3002
```

---

## 📚 Tools Disponibles

| Tool | Description |
|------|-------------|
| `modes.list` | Lister les modes |
| `modes.get` | Détail d'un mode |
| `modes.plan` | Générer un plan |
| `modes.render` | Renderer un mode |
| `modes.suggest` | Suggérer des modes |
| `orchestrate.run` | Lancer un agent |
| `orchestrate.continue` | Continuer un run |
| `orchestrate.status` | Status d'un run |
| `orchestrate.cancel` | Annuler un run |
| `workspace.applyPatch` | Appliquer un patch |
| `exec.run` | Exécuter une commande |
| `git.status` | Status git |
| `git.diff` | Diff git |
| `git.commit` | Committer |
| `git.branch.create` | Créer une branche |
| `runs.telemetry.append` | Enregistrer telemetry |

---

## 🎯 Prochaines Étapes

- [ ] Configurer Cursor
- [ ] Configurer Claude Desktop
- [ ] Tester les tools
- [ ] Créer un run de test
- [ ] Voir les résultats dans le dashboard
- [ ] Configurer l'auth (optionnel)
