# Remote MCP HTTP (Num Agents)

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mcp/tools` | GET | List all tools with metadata |
| `/mcp/tools/:name` | GET | Get tool detail (inputSchema, outputSchema, examples) |
| `/mcp/call` | POST | Call a tool `{ tool, input }` |
| `/openapi.json` | GET | OpenAPI 3.0 specification |

## Authentication

If the server is started with `requireAuth=true`, add:
```
Authorization: Bearer <JWT>
```

## Examples

### Health check
```bash
curl http://localhost:3001/health
```

### List tools
```bash
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools
```

### Get tool detail
```bash
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools/modes.list
```

### Call a tool
```bash
curl -X POST http://localhost:3001/mcp/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NUM_TOKEN" \
  -d '{"tool":"modes.list","input":{}}'
```

### Get OpenAPI spec
```bash
curl http://localhost:3001/openapi.json
```

## Response Format

### Success
```json
{
  "ok": true,
  "content": [{ "type": "text", "text": "..." }]
}
```

### Error
```json
{
  "ok": false,
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHENTICATED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TOOL_NOT_FOUND` | 404 | Unknown tool name |
| `RATE_LIMIT` | 429 | Too many requests |
| `TOOL_ERROR` | 500 | Tool execution failed |

## Tips

- For IDE integration: `/mcp/tools` provides `inputSchema`, `outputSchema`, and `examples`
- For API clients: `/openapi.json` provides a complete OpenAPI 3.0 spec
- RBAC: Viewer role can access `modes.*` but not `exec.run` or `pipeline.apply`
