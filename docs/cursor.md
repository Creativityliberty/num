# Cursor + Num Agents (MCP HTTP)

## Prerequisites

1. Start the Num Agents server in HTTP mode:
```bash
node dist/cli.js serve --modes-path ./modes --policy ./policy.json --http --port 3001 --require-auth
```

2. Generate and export a JWT token:
```bash
export NUM_TOKEN="your-jwt-token"
```

## Cursor Configuration

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": [
    {
      "name": "num-agents",
      "url": "http://localhost:3001",
      "headers": {
        "Authorization": "Bearer ${NUM_TOKEN}"
      }
    }
  ]
}
```

## Verification

After configuring, Cursor should display the available tools:
- `modes.list`, `modes.get`, `modes.validate`, `modes.simulate`
- `agents.plan`, `agents.next`, `agents.submit`
- `orchestrate.run`, `orchestrate.continue`, `orchestrate.status`
- `pack.export`, `pack.import`
- And more...

If tools don't appear, verify the server is running:
```bash
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools
```

## Tool Schemas

Cursor can use the tool metadata to:
- Auto-generate input forms
- Display parameter descriptions
- Show expected output format
- Provide inline help

Access tool details via:
```bash
curl -H "Authorization: Bearer $NUM_TOKEN" http://localhost:3001/mcp/tools/agents.plan
```

## RBAC Notes

| Role | Accessible Tools |
|------|------------------|
| **viewer** | `modes.*`, `pack.list` |
| **developer** | All above + `agents.*`, `orchestrate.*`, `pack.*`, `git.*` |
| **admin** | All tools including `exec.run`, `policy.*` |

## Troubleshooting

### "UNAUTHENTICATED" error
- Check that `NUM_TOKEN` environment variable is set
- Verify token is valid and not expired

### "FORBIDDEN" error
- User role doesn't have permission for the requested tool
- Check RBAC configuration

### Connection refused
- Ensure server is running on the correct port
- Check firewall settings
