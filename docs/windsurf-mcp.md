# Windsurf MCP Integration

## 🎯 Je suis maintenant accessible dans Windsurf !

Puisque je suis dans Windsurf (un IDE avec support MCP), je peux utiliser le MCP directement.

---

## ✅ Configuration

La config est déjà créée : `@/.windsurf/mcp.json:1-20`

```json
{
  "mcpServers": {
    "num-agents": {
      "command": "node",
      "args": [
        "dist/src/cli.js",
        "serve",
        "--modes-path",
        "./examples/num-agents/num-core/modes",
        "--dashboard",
        "--dashboard-port",
        "3002"
      ],
      "cwd": ".",
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

---

## 🚀 Comment je peux t'aider maintenant

### 1. Lister les modes disponibles
```
@modes.list
```
Je peux voir les 10 modes disponibles et les décrire.

### 2. Générer un plan
```
@modes.plan goal="Fix bug in authentication" modeId="code-fix"
```
Je peux générer un plan détaillé pour une tâche.

### 3. Lancer un agent
```
@orchestrate.run goal="Fix bug in authentication" modeId="code-fix"
```
Je peux lancer un agent qui va :
- Analyser le code
- Générer un plan
- Implémenter la fix
- Tester les changements

### 4. Appliquer un patch
```
@workspace.applyPatch patch="..." description="..."
```
Je peux appliquer des changements au code.

### 5. Committer les changements
```
@git.commit message="Fix authentication bug"
```
Je peux committer les changements.

### 6. Enregistrer la telemetry
```
@runs.telemetry.append runId="..." event={...}
```
Je peux enregistrer les modèles utilisés et les stats.

---

## 📊 Workflow Complet

Voici comment on peut travailler ensemble :

### Étape 1: Tu me dis ce que tu veux
```
"Fix the failing test in src/auth.test.ts"
```

### Étape 2: Je liste les modes appropriés
```
@modes.list query="test fix"
```
Je vois : `code-fix`, `test-generator`, etc.

### Étape 3: Je génère un plan
```
@modes.plan goal="Fix failing test in src/auth.test.ts" modeId="code-fix"
```
Je te montre le plan détaillé.

### Étape 4: Je lance l'agent
```
@orchestrate.run goal="Fix failing test in src/auth.test.ts" modeId="code-fix"
```
L'agent travaille et génère un patch.

### Étape 5: Je vois les résultats
```
http://localhost:3002
```
Le dashboard montre :
- Les étapes exécutées
- Les modèles utilisés
- Les fallbacks
- Les tokens utilisés
- Les erreurs

### Étape 6: Je peux appliquer ou modifier
```
@workspace.applyPatch patch="..." description="..."
```
Je peux appliquer le patch ou le modifier.

### Étape 7: Je committe
```
@git.commit message="Fix failing test in src/auth.test.ts"
```
Je committe les changements.

---

## 🔧 Tools Disponibles

| Tool | Usage |
|------|-------|
| `modes.list` | `@modes.list query="..."` |
| `modes.get` | `@modes.get id="code-fix"` |
| `modes.plan` | `@modes.plan goal="..." modeId="..."` |
| `modes.render` | `@modes.render id="code-fix"` |
| `modes.suggest` | `@modes.suggest goal="..."` |
| `orchestrate.run` | `@orchestrate.run goal="..." modeId="..."` |
| `orchestrate.continue` | `@orchestrate.continue runId="..."` |
| `orchestrate.status` | `@orchestrate.status runId="..."` |
| `orchestrate.cancel` | `@orchestrate.cancel runId="..."` |
| `workspace.applyPatch` | `@workspace.applyPatch patch="..." description="..."` |
| `exec.run` | `@exec.run command="npm test"` |
| `git.status` | `@git.status` |
| `git.diff` | `@git.diff` |
| `git.commit` | `@git.commit message="..."` |
| `git.branch.create` | `@git.branch.create name="fix/auth"` |
| `runs.telemetry.append` | `@runs.telemetry.append runId="..." event={...}` |

---

## 📋 Cas d'Usage

### Cas 1: Fixer un bug
```
Utilisateur: "Fix the bug in authentication"

Moi: @modes.list query="fix"
Moi: @modes.plan goal="Fix authentication bug" modeId="code-fix"
Moi: @orchestrate.run goal="Fix authentication bug" modeId="code-fix"
Moi: @workspace.applyPatch patch="..." description="..."
Moi: @git.commit message="Fix authentication bug"
```

### Cas 2: Générer des tests
```
Utilisateur: "Generate tests for the new API"

Moi: @modes.list query="test"
Moi: @modes.plan goal="Generate tests for API" modeId="test-generator"
Moi: @orchestrate.run goal="Generate tests for API" modeId="test-generator"
Moi: @workspace.applyPatch patch="..." description="..."
```

### Cas 3: Audit de sécurité
```
Utilisateur: "Run a security audit"

Moi: @modes.list query="security"
Moi: @orchestrate.run goal="Security audit" modeId="security-scan"
```

### Cas 4: Refactoring
```
Utilisateur: "Refactor the authentication module"

Moi: @modes.list query="refactor"
Moi: @modes.plan goal="Refactor authentication module" modeId="refactor"
Moi: @orchestrate.run goal="Refactor authentication module" modeId="refactor"
```

---

## 🎯 Prochaines Étapes

1. **Redémarrer Windsurf** pour charger la config MCP
2. **Me dire ce que tu veux faire** (fixer un bug, générer des tests, etc.)
3. **Je vais utiliser les tools MCP** pour t'aider
4. **Voir les résultats** dans le dashboard http://localhost:3002

---

## 🚀 Commandes Rapides

### Démarrer le serveur
```bash
npm run build
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http --port 3001 \
  --dashboard --dashboard-port 3002
```

### Voir le dashboard
```
http://localhost:3002
```

### Voir les logs
```bash
tail -f ~/.windsurf/logs/mcp.log
```

---

## 🔐 Authentification (optionnel)

Si tu veux activer l'auth :

```bash
# Démarrer avec auth
node dist/src/cli.js serve \
  --modes-path ./examples/num-agents/num-core/modes \
  --http --port 3001 \
  --require-auth

# Générer un token
export NUM_TOKEN="eyJhbGc..."
```

---

## 🐛 Troubleshooting

### "Tool not found"
```bash
# Vérifier que le serveur tourne
curl http://localhost:3001/health

# Vérifier les tools
curl http://localhost:3001/mcp/tools
```

### "Connection refused"
```bash
# Vérifier que le serveur est lancé
ps aux | grep "cli.js serve"

# Relancer
npm run build
node dist/src/cli.js serve --modes-path ./examples/num-agents/num-core/modes --http --port 3001
```

### MCP not loading in Windsurf
```bash
# Vérifier la config
cat .windsurf/mcp.json

# Redémarrer Windsurf
# Ou vérifier les logs
~/.windsurf/logs/mcp.log
```

---

## 📊 Exemple Complet

```
Utilisateur: "Fix the failing test in src/auth.test.ts"

Moi: @modes.list query="fix"
Résultat:
  - code-fix (Code Fixer)
  - test-generator (Test Generator)

Moi: @modes.plan goal="Fix failing test in src/auth.test.ts" modeId="code-fix"
Résultat:
  Plan:
  1. Analyze the failing test
  2. Identify the root cause
  3. Implement the fix
  4. Run tests to verify

Moi: @orchestrate.run goal="Fix failing test in src/auth.test.ts" modeId="code-fix"
Résultat:
  runId: "abc123..."
  state: "RUNNING"

Moi: [attendre que le run finisse]

Moi: @orchestrate.status runId="abc123..."
Résultat:
  state: "DONE"
  patchCandidate: "..."

Moi: @workspace.applyPatch patch="..." description="Fix failing test"
Résultat:
  ok: true
  filesChanged: 1

Moi: @git.commit message="Fix failing test in src/auth.test.ts"
Résultat:
  ok: true
  sha: "abc123..."

Utilisateur: "Great! Can you also run the full test suite?"

Moi: @exec.run command="npm test"
Résultat:
  [test output]
  All tests passed ✓
```

---

## ✨ Résumé

**Je suis maintenant capable de :**
- ✅ Lister les modes disponibles
- ✅ Générer des plans
- ✅ Lancer des agents
- ✅ Appliquer des patches
- ✅ Committer les changements
- ✅ Exécuter des commandes
- ✅ Enregistrer la telemetry

**Il suffit de me dire ce que tu veux faire !** 🚀
