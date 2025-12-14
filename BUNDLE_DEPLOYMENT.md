# MCP Server Bundle - Deployment Instructions

## Overview
This is a complete, production-ready MCP server bundle with:
- 28 agents (4 standard + 24 custom modes)
- 9 Gemini API handlers
- 14 integrated tools
- Real-time dashboard
- Full API endpoints

## Quick Start

### 1. Standalone (Local Development)
```bash
# Install dependencies
npm install

# Build
npm run build

# Start server
node scripts/start-mcp-server.mjs

# Access dashboard
open http://127.0.0.1:3457
```

### 2. Docker (Single Container)
```bash
# Build image
docker build -t num-agents-mcp:3.0.0 .

# Run container
docker run -p 3457:3457 \
  -e GEMINI_API_KEY=your_api_key \
  num-agents-mcp:3.0.0

# Access dashboard
open http://localhost:3457
```

### 3. Docker Compose (Full Stack)
```bash
# Set environment variable
export GEMINI_API_KEY=your_api_key

# Start services
docker-compose up -d

# Access services
- MCP Server: http://localhost:3457
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
```

### 4. Kubernetes (Production)
```bash
# Create secret
kubectl create secret generic mcp-secrets \
  --from-literal=gemini-api-key=your_api_key

# Deploy
kubectl apply -f kubernetes.yaml

# Get service IP
kubectl get service num-agents-mcp-service

# Access dashboard
open http://<SERVICE_IP>:3457
```

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Gemini API key (required)
- `LOG_LEVEL` - Log level (info, debug, error)
- `NODE_ENV` - Environment (production, development)

### API Endpoints
- `GET /api/mcp/tools` - List all 14 tools
- `GET /api/catalog` - List all agents
- `GET /api/gemini/handlers` - List handlers
- `POST /api/playground/simulate` - Execute task
- `GET /api/flow/status` - Get flow status

### Dashboard Pages
- `http://localhost:3457/` - Main dashboard
- `http://localhost:3457/catalog` - Browse agents
- `http://localhost:3457/playground` - Test tools
- `http://localhost:3457/gemini-handlers` - Manage handlers
- `http://localhost:3457/flow-visualizer` - Visualize flow

## Monitoring

### Prometheus Metrics
- Request count and latency
- Error rates
- Token usage
- Cost tracking

### Grafana Dashboards
- System health
- API performance
- Agent execution stats
- Cost analysis

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple instances
- Use Redis for session management
- Database replication for high availability

### Vertical Scaling
- Increase CPU/memory limits
- Optimize token caching
- Use batch processing
- Implement request queuing

## Security

### Production Checklist
- [ ] Enable HTTPS/TLS
- [ ] Use strong API keys
- [ ] Implement rate limiting
- [ ] Enable authentication
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup strategy

### API Security
- API key validation
- CORS configuration
- Request rate limiting
- Input validation
- Error handling

## Troubleshooting

### Server won't start
```bash
# Check logs
docker logs num-agents-mcp

# Verify API key
echo $GEMINI_API_KEY

# Check port availability
lsof -i :3457
```

### High latency
- Check token caching is enabled
- Use batch processing for multiple tasks
- Monitor Prometheus metrics
- Check Grafana dashboards

### Memory issues
- Increase container memory limits
- Enable token caching
- Use long-context for large documents
- Monitor memory usage

## Support

For issues or questions:
1. Check logs: `docker logs num-agents-mcp`
2. Review API endpoints: `http://localhost:3457/api/mcp/tools`
3. Test dashboard: `http://localhost:3457`
4. Run tests: `node scripts/test-system.mjs YOUR_API_KEY`

## Version
- MCP Server: 3.0.0
- Node.js: 18+
- Agents: 28
- Tools: 14
- Handlers: 9
