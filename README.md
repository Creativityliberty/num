# Num Agents v3.0 - MCP Server

Production-ready Multi-Agent Control Plane with Gemini API integration, Flow DAG execution, and comprehensive dashboard.

## Features

- **28 Agents** (4 standard + 24 custom modes)
- **9 Gemini Handlers** (LLM, Function Calling, Computer Use, Batch Processing, Caching, Long Context, Embeddings, RAG, Research)
- **14 Integrated Tools** (file operations, code execution, web search, etc.)
- **Flow DAG Execution** (serial, parallel, conditional patterns)
- **Real-time Dashboard** (http://127.0.0.1:3457)
- **REST API** with comprehensive endpoints
- **Docker & Kubernetes** deployment ready

## Quick Start

```bash
npm install
npm run build
node scripts/start-mcp-server.mjs
```

Access dashboard: http://127.0.0.1:3457

## API Endpoints

- `GET /api/mcp/tools` - List all tools
- `GET /api/catalog` - Agent catalog
- `GET /api/gemini/handlers` - Gemini handlers status
- `GET /api/flow/status` - Flow execution status

## Deployment

### Docker
```bash
docker build -t num-agents:latest .
docker run -p 3457:3457 num-agents:latest
```

### Docker Compose
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f kubernetes.yaml
```

## Documentation

- `BUNDLE_MANIFEST.json` - Bundle metadata
- `DEPLOYMENT_CONFIG.json` - Deployment configuration
- `BUNDLE_DEPLOYMENT.md` - Detailed deployment instructions

## License

MIT
