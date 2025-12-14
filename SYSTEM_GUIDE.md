# Num Agents v3.0 — Système Complet & Guide d'Installation

**© 2025 Numtema Foundry AI** - Tous droits réservés. Confidentiel.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Démarrage](#démarrage)
5. [Utilisation](#utilisation)
6. [API Endpoints](#api-endpoints)
7. [Dashboard](#dashboard)
8. [Agents & Modes](#agents--modes)
9. [Handlers Gemini](#handlers-gemini)
10. [Outils Intégrés](#outils-intégrés)
11. [Flow DAG](#flow-dag)
12. [Déploiement](#déploiement)
13. [Monétisation](#monétisation)

---

## 🎯 Vue d'ensemble

**Num Agents v3.0** est un système de contrôle multi-agents production-ready avec intégration Gemini API, exécution Flow DAG et dashboard temps réel.

### Caractéristiques Principales

- ✅ **28 Agents** (4 standard + 24 modes personnalisés)
- ✅ **9 Handlers Gemini** (LLM, Function Calling, Computer Use, Batch, Caching, Long Context, Embeddings, RAG, Research)
- ✅ **14 Outils Intégrés** (fichiers, code, web, embeddings, RAG, etc.)
- ✅ **Flow DAG Engine** (exécution série, parallèle, conditionnelle)
- ✅ **Dashboard Temps Réel** (7 pages, monitoring live)
- ✅ **API REST** (6+ endpoints)
- ✅ **Docker & Kubernetes** (déploiement prêt)

### Cas d'Usage

| Cas | Description |
|-----|-------------|
| **Analyse de Données** | Agents d'analyse avec RAG et embeddings |
| **Génération de Code** | Agents de développement avec exécution de code |
| **Recherche & Synthèse** | Agents de recherche avec long context |
| **Orchestration Complexe** | Flow DAG pour workflows multi-étapes |
| **Traitement Batch** | Batch processing avec caching de tokens |
| **Multimodal** | Computer use et traitement vidéo/PDF |

---

## 🏗️ Architecture

### Composants Principaux

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard UI                          │
│  (7 pages: Agents, Modes, Handlers, Flows, Logs, etc)  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API Gateway                             │
│  (/api/mcp/tools, /api/gemini/handlers, /api/flow/...)  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Orchestration Engine                        │
│  (Agent Manager, Flow DAG Runner, Mode Executor)        │
└────────────────────┬────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
┌─────▼────┐  ┌─────▼────┐  ┌─────▼────┐
│  Agents  │  │ Handlers │  │   Tools  │
│  (28)    │  │  (9)     │  │  (14)    │
└──────────┘  └──────────┘  └──────────┘
```

### Stack Technique

- **Runtime:** Node.js (ESM modules)
- **Framework:** Express.js
- **Language:** TypeScript
- **API:** Gemini (Google)
- **Database:** En mémoire (extensible)
- **Monitoring:** Prometheus + Grafana
- **Container:** Docker + Kubernetes

---

## 💾 Installation

### Prérequis

- Node.js 18+ (LTS recommandé)
- npm 9+
- Git
- Clé API Gemini (optionnel pour les tests)

### Option 1: NPM (Recommandé)

```bash
# Installation globale
npm install -g num-agents

# Ou installation locale
npm install num-agents

# Vérifier l'installation
num-agents --version
```

### Option 2: Depuis GitHub

```bash
# Cloner le repository
git clone https://github.com/Creativityliberty/num.git
cd num

# Installer les dépendances
npm install

# Compiler TypeScript
npm run build

# Vérifier la compilation
ls -la dist/
```

### Option 3: Docker

```bash
# Construire l'image
docker build -t num-agents:latest .

# Ou utiliser Docker Compose
docker-compose up -d

# Vérifier le démarrage
docker logs -f num-agents
```

### Configuration Initiale

```bash
# Créer un dossier de modes personnalisés
mkdir -p ./custom_modes

# Créer un fichier de configuration (optionnel)
cat > .env << EOF
GEMINI_API_KEY=your_api_key_here
MCP_PORT=3457
DASHBOARD_ENABLED=true
EOF
```

---

## 🚀 Démarrage

### Démarrage Local

```bash
# Depuis NPM
npx num-agents serve \
  --modes-path ./custom_modes \
  --dashboard \
  --dashboard-port 3457

# Ou depuis le repository
npm run start

# Ou directement
node scripts/start-mcp-server.mjs
```

### Vérifier le Démarrage

```bash
# Vérifier que le serveur écoute
curl http://127.0.0.1:3457/

# Vérifier les agents
curl http://127.0.0.1:3457/api/mcp/tools

# Vérifier les handlers
curl http://127.0.0.1:3457/api/gemini/handlers
```

### Accès au Dashboard

```
Dashboard: http://127.0.0.1:3457
API Base: http://127.0.0.1:3457/api
```

---

## 📖 Utilisation

### Exécuter un Agent via API

```bash
curl -X POST http://127.0.0.1:3457/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "analysis-agent",
    "input": {
      "task": "Analyser ce texte: Lorem ipsum dolor sit amet"
    }
  }'
```

### Exécuter un Flow DAG

```bash
curl -X POST http://127.0.0.1:3457/api/flows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "flowId": "api-design-flow",
    "input": {
      "requirements": "Créer une API REST pour gestion de tâches"
    }
  }'
```

### Utiliser un Mode Personnalisé

```bash
# Créer un mode YAML
cat > ./custom_modes/my-mode.yaml << EOF
id: my-custom-mode
name: Mon Mode Personnalisé
description: Un mode personnalisé pour mon cas d'usage
tags: [custom, analysis]
prompts:
  system: "Tu es un expert en analyse de données"
  developer: "Aide l'utilisateur à analyser les données"
EOF

# Redémarrer le serveur
# Le mode sera automatiquement chargé
```

---

## 🔌 API Endpoints

### Agents

```
GET  /api/mcp/tools              # Lister tous les outils (14)
GET  /api/catalog                # Catalogue des agents
POST /api/agents/execute         # Exécuter un agent
GET  /api/agents/{id}            # Détails d'un agent
```

### Handlers Gemini

```
GET  /api/gemini/handlers        # Lister les 9 handlers
GET  /api/gemini/handlers/{id}   # Détails d'un handler
POST /api/gemini/call            # Appel direct Gemini
```

### Flows

```
GET  /api/flow/status            # Statut des flows
POST /api/flows/execute          # Exécuter un flow
GET  /api/flows/{id}             # Détails d'un flow
```

### Modes

```
GET  /api/modes                  # Lister les modes
POST /api/modes/reload           # Recharger les modes
GET  /api/modes/{id}             # Détails d'un mode
```

### Utilisation

```
GET  /api/usage/stats            # Statistiques d'utilisation
GET  /api/usage/logs             # Logs d'exécution
```

---

## 📊 Dashboard

### Pages Disponibles

| Page | Description |
|------|-------------|
| **Agents** | Liste et détails des 28 agents |
| **Modes** | Modes personnalisés chargés |
| **Handlers** | État des 9 handlers Gemini |
| **Flows** | Exécution et visualisation des flows |
| **Logs** | Historique des exécutions |
| **Monitoring** | Métriques Prometheus |
| **Settings** | Configuration du serveur |

### Accès

```
URL: http://127.0.0.1:3457
Port: 3457 (configurable)
```

### Fonctionnalités

- ✅ Exécution d'agents en temps réel
- ✅ Visualisation des flows DAG
- ✅ Monitoring des handlers
- ✅ Historique des exécutions
- ✅ Gestion des modes personnalisés
- ✅ Métriques de performance

---

## 🤖 Agents & Modes

### 4 Agents Standard

| Agent | Description | Cas d'Usage |
|-------|-------------|------------|
| **Analysis Agent** | Analyse de données et texte | Synthèse, classification |
| **Planning Agent** | Planification et orchestration | Workflows complexes |
| **Solutioning Agent** | Génération de solutions | Brainstorming, design |
| **Implementation Agent** | Exécution et implémentation | Développement, déploiement |

### 24 Modes Personnalisés

Modes YAML pré-configurés pour différents cas d'usage:

```yaml
# Exemple: Mode de Recherche
id: research-mode
name: Mode Recherche Approfondie
description: Recherche et synthèse avec long context
tags: [research, synthesis]
prompts:
  system: "Tu es un chercheur expert avec accès à long context"
  developer: "Aide à la recherche et synthèse d'informations"
```

### Créer un Mode Personnalisé

```bash
# 1. Créer le fichier YAML
cat > ./custom_modes/my-mode.yaml << EOF
id: my-mode
name: Mon Mode
description: Description
tags: [custom]
prompts:
  system: "Prompt système"
  developer: "Prompt développeur"
EOF

# 2. Redémarrer le serveur
# Le mode sera automatiquement chargé et disponible

# 3. Utiliser via API
curl -X POST http://127.0.0.1:3457/api/agents/execute \
  -d '{"modeId": "my-mode", "input": {...}}'
```

---

## 🔧 Handlers Gemini

### 9 Handlers Disponibles

| Handler | Description | Cas d'Usage |
|---------|-------------|------------|
| **LLMHandler** | Appels LLM standard | Génération de texte |
| **FunctionCallingHandler** | Appels de fonctions | Exécution d'actions |
| **ComputerUseHandler** | Contrôle d'ordinateur | Automation, RPA |
| **BatchProcessingHandler** | Traitement batch | Traitement massif (50% savings) |
| **CachingTokensHandler** | Caching de tokens | Réduction coûts (90% savings) |
| **LongContextHandler** | Long context (100k tokens) | Documents longs |
| **EmbeddingsRAGHandler** | Embeddings + RAG | Recherche sémantique |
| **DeepResearchAgentHandler** | Recherche approfondie | Analyse complexe |
| **GeminiConfigManager** | Gestion de configuration | Configuration centralisée |

### Utiliser un Handler

```bash
# Appel direct
curl -X POST http://127.0.0.1:3457/api/gemini/call \
  -d '{
    "handler": "LLMHandler",
    "prompt": "Explique le machine learning",
    "model": "gemini-2.0-flash"
  }'

# Via agent
curl -X POST http://127.0.0.1:3457/api/agents/execute \
  -d '{
    "agentId": "analysis-agent",
    "handler": "LongContextHandler",
    "input": {...}
  }'
```

---

## 🛠️ Outils Intégrés

### 14 Outils Disponibles

| Outil | Description | Exemple |
|-------|-------------|---------|
| **File Upload** | Upload de fichiers | Documents, images |
| **File List** | Lister les fichiers | Exploration |
| **File Delete** | Supprimer des fichiers | Nettoyage |
| **Code Execution** | Exécuter du code | Python, Node.js |
| **Web Search** | Recherche web | Informations actuelles |
| **Embeddings** | Créer des embeddings | Vectorisation |
| **RAG Retrieve** | Récupérer via RAG | Recherche sémantique |
| **PDF Processing** | Traiter des PDFs | Extraction de texte |
| **Video Processing** | Traiter des vidéos | Analyse vidéo |
| **Batch Submit** | Soumettre des batches | Traitement massif |
| **Token Caching** | Cacher les tokens | Optimisation coûts |
| **Long Context** | Contexte long | Documents longs |
| **Function Call** | Appels de fonctions | Actions personnalisées |
| **Computer Use** | Contrôle d'ordinateur | Automation |

### Utiliser un Outil

```bash
# Upload de fichier
curl -X POST http://127.0.0.1:3457/api/tools/file-upload \
  -F "file=@document.pdf"

# Recherche web
curl -X POST http://127.0.0.1:3457/api/tools/web-search \
  -d '{"query": "dernières nouvelles IA"}'

# Exécution de code
curl -X POST http://127.0.0.1:3457/api/tools/code-execution \
  -d '{"code": "print(\"Hello World\")", "language": "python"}'
```

---

## 📊 Flow DAG

### Qu'est-ce qu'un Flow DAG?

Un **Directed Acyclic Graph** (DAG) pour orchestrer des workflows complexes avec:
- Exécution série (étapes séquentielles)
- Exécution parallèle (étapes simultanées)
- Exécution conditionnelle (branches)

### Patterns Disponibles

```typescript
// Pattern Série
{
  pattern: 'serial',
  nodes: [
    { id: 'step1', ... },
    { id: 'step2', ... },  // Exécuté après step1
    { id: 'step3', ... }   // Exécuté après step2
  ]
}

// Pattern Parallèle
{
  pattern: 'parallel',
  nodes: [
    { id: 'step1', ... },
    { id: 'step2', ... },  // Exécuté en même temps
    { id: 'step3', ... }   // Exécuté en même temps
  ]
}

// Pattern Conditionnel
{
  pattern: 'conditional',
  nodes: [
    { id: 'check', condition: true },
    { id: 'if-true', ... },
    { id: 'if-false', ... }
  ]
}
```

### Flows Pré-configurés

| Flow | Pattern | Description |
|------|---------|-------------|
| **API Design Flow** | Serial | Conception d'API REST |
| **Code Review Flow** | Parallel | Revue de code multi-agents |
| **UX Design Flow** | Serial | Design UX/UI |

### Créer un Flow Personnalisé

```typescript
import { Node } from './flow-dag/node';
import { FlowDefinition } from './flow-dag/runner';

export const myFlow: FlowDefinition = {
  id: 'my-flow',
  name: 'Mon Flow Personnalisé',
  description: 'Un flow pour mon cas d\'usage',
  pattern: 'serial',
  nodes: [
    new Node({
      id: 'step1',
      name: 'Étape 1',
      agent: 'analysis-agent',
      input: { task: 'Analyser' }
    }),
    new Node({
      id: 'step2',
      name: 'Étape 2',
      agent: 'solutioning-agent',
      input: { context: '${step1.output}' }
    })
  ]
};
```

---

## 🐳 Déploiement

### Docker

```bash
# Construire l'image
docker build -t num-agents:latest .

# Lancer le conteneur
docker run -p 3457:3457 \
  -e GEMINI_API_KEY=your_key \
  num-agents:latest

# Avec volumes
docker run -p 3457:3457 \
  -v $(pwd)/custom_modes:/app/custom_modes \
  -v $(pwd)/data:/app/data \
  num-agents:latest
```

### Docker Compose

```bash
# Démarrer la stack complète
docker-compose up -d

# Inclut: MCP Server + Prometheus + Grafana
# Accès:
#   - MCP: http://localhost:3457
#   - Prometheus: http://localhost:9090
#   - Grafana: http://localhost:3000
```

### Kubernetes

```bash
# Déployer sur Kubernetes
kubectl apply -f kubernetes.yaml

# Vérifier le déploiement
kubectl get pods
kubectl logs -f deployment/num-agents

# Accès
kubectl port-forward svc/num-agents 3457:3457
```

### Production Checklist

- ✅ Configurer les variables d'environnement
- ✅ Mettre en place la persistance de données
- ✅ Configurer les logs centralisés
- ✅ Mettre en place le monitoring (Prometheus)
- ✅ Configurer les alertes
- ✅ Mettre en place la sauvegarde
- ✅ Configurer le reverse proxy (Nginx)
- ✅ Activer HTTPS/TLS

---

## 💰 Monétisation

### Modèles de Pricing

#### Option A: SaaS Cloud Hosted

```
Starter: $29/mois
  - 1,000 appels/jour
  - 5 agents max
  - Support email

Pro: $99/mois
  - 10,000 appels/jour
  - 28 agents
  - Support prioritaire
  - Webhooks illimités

Enterprise: Custom
  - Appels illimités
  - SLA 99.9%
  - Support 24/7
  - Déploiement on-premise
```

#### Option B: Self-Hosted License

```
Single Server: $199/mois
Multi-Server: $499/mois
Unlimited: $999/mois
```

#### Option C: Pay-as-You-Go

```
$0.001 par appel API
$0.01 par token Gemini utilisé
$0.05 par agent exécution
```

### Avantages Compétitifs

- ✅ 28 agents pré-configurés
- ✅ 9 handlers Gemini (multimodal)
- ✅ Flow DAG orchestration
- ✅ Dashboard temps réel
- ✅ Open source core
- ✅ Self-hosted option

### Go-to-Market

1. **Beta (Gratuit)** - 100 utilisateurs beta
2. **Launch (Freemium)** - Free tier + Paid tiers
3. **Growth** - Partnerships, intégrations, marketplace

---

## 📚 Ressources Supplémentaires

### Documentation

- **README.md** - Vue d'ensemble du projet
- **BUNDLE_DEPLOYMENT.md** - Instructions de déploiement
- **NPM_2FA_SETUP.md** - Configuration NPM 2FA

### Liens Utiles

- **NPM Package:** https://www.npmjs.com/package/num-agents
- **GitHub:** https://github.com/Creativityliberty/num
- **Dashboard:** http://127.0.0.1:3457
- **API Docs:** http://127.0.0.1:3457/api

### Support

- **Email:** numtemalionel@gmail.com
- **GitHub Issues:** https://github.com/Creativityliberty/num/issues
- **Documentation:** Voir les fichiers .md du repository

---

## 🔐 Sécurité

### Bonnes Pratiques

- ✅ Utiliser des variables d'environnement pour les clés API
- ✅ Activer HTTPS/TLS en production
- ✅ Mettre en place l'authentification API
- ✅ Limiter les taux d'appels (rate limiting)
- ✅ Valider les entrées utilisateur
- ✅ Chiffrer les données sensibles
- ✅ Mettre en place les logs d'audit
- ✅ Utiliser des secrets managers

### Configuration Sécurisée

```bash
# Variables d'environnement
export GEMINI_API_KEY="sk_live_xxx"
export MCP_PORT=3457
export NODE_ENV=production
export LOG_LEVEL=info

# Fichier .env (ne pas committer)
GEMINI_API_KEY=sk_live_xxx
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
```

---

## 🎓 Tutoriels

### Tutoriel 1: Votre Premier Agent

```bash
# 1. Démarrer le serveur
npm run start

# 2. Accéder au dashboard
open http://127.0.0.1:3457

# 3. Exécuter un agent
curl -X POST http://127.0.0.1:3457/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "analysis-agent",
    "input": {"task": "Analyser ce texte"}
  }'

# 4. Vérifier les logs
curl http://127.0.0.1:3457/api/usage/logs
```

### Tutoriel 2: Créer un Mode Personnalisé

```bash
# 1. Créer le fichier
mkdir -p ./custom_modes
cat > ./custom_modes/my-analyzer.yaml << EOF
id: my-analyzer
name: Mon Analyseur
description: Analyseur personnalisé
tags: [custom, analysis]
prompts:
  system: "Tu es un expert en analyse"
  developer: "Aide l'utilisateur"
EOF

# 2. Redémarrer le serveur
# Le mode est automatiquement chargé

# 3. Utiliser le mode
curl -X POST http://127.0.0.1:3457/api/agents/execute \
  -d '{"modeId": "my-analyzer", "input": {...}}'
```

### Tutoriel 3: Exécuter un Flow DAG

```bash
# 1. Accéder au dashboard
open http://127.0.0.1:3457

# 2. Aller à la page "Flows"

# 3. Sélectionner un flow (ex: api-design-flow)

# 4. Entrer les paramètres d'entrée

# 5. Cliquer "Execute"

# 6. Voir l'exécution en temps réel
```

---

## 🐛 Troubleshooting

### Problème: Port déjà utilisé

```bash
# Trouver le processus
lsof -i :3457

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
npm run start -- --dashboard-port 3458
```

### Problème: Clé API Gemini invalide

```bash
# Vérifier la clé
echo $GEMINI_API_KEY

# Générer une nouvelle clé
# https://aistudio.google.com/app/apikey

# Configurer
export GEMINI_API_KEY="your_new_key"
```

### Problème: Modes non chargés

```bash
# Vérifier le chemin
ls -la ./custom_modes/

# Vérifier la syntaxe YAML
cat ./custom_modes/my-mode.yaml

# Redémarrer le serveur
npm run start
```

### Problème: Erreurs de compilation TypeScript

```bash
# Nettoyer et recompiler
rm -rf dist/
npm run build

# Vérifier les erreurs
npm run build 2>&1 | grep error
```

---

## 📝 Licence

**PRIVATE** - © 2025 Numtema Foundry AI. Tous droits réservés.

Utilisation autorisée uniquement avec permission explicite.

---

## 📞 Contact

**Numtema Foundry AI**
- Email: numtemalionel@gmail.com
- GitHub: https://github.com/Creativityliberty/num
- Website: https://numtema.ai

---

**Dernière mise à jour:** Décembre 2025
**Version:** 3.0.1
**Status:** Production Ready ✅
