import type { IncomingMessage, ServerResponse } from 'node:http';
import {
    apiDesignFlowDefinition,
    codeReviewFlowDefinition,
    uxDesignFlowDefinition,
} from '../../flow-dag/examples.js';
import {
    NumFlowOrchestrator,
    numflowPhase1Analysis,
    numflowPhase2Planning,
    numflowPhase3Solutioning,
    numflowPhase4Implementation,
} from '../../flow-dag/numflow.js';
import { Store } from '../../flow-dag/store.js';

// In-memory storage for runs
const activeRuns = new Map<string, any>();
const numflowOrchestrator = new NumFlowOrchestrator();
const flowRegistry = new Map<string, any>([
  ['api-design-flow', apiDesignFlowDefinition],
  ['code-review-flow', codeReviewFlowDefinition],
  ['ux-design-flow', uxDesignFlowDefinition],
  ['numflow-phase1-analysis', numflowPhase1Analysis],
  ['numflow-phase2-planning', numflowPhase2Planning],
  ['numflow-phase3-solutioning', numflowPhase3Solutioning],
  ['numflow-phase4-implementation', numflowPhase4Implementation],
]);

// MCP Tools Registry
const mcpToolsRegistry = [
  {
    name: 'modes.list',
    description: 'List all available agent modes',
    category: 'agents',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Filter by role or module' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        modes: { type: 'array' },
        count: { type: 'number' },
      },
    },
  },
  {
    name: 'agents.plan',
    description: 'Create a plan for an agent to execute',
    category: 'agents',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string' },
        goal: { type: 'string' },
        context: { type: 'string' },
      },
      required: ['agentId', 'goal'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        plan: { type: 'object' },
        steps: { type: 'array' },
      },
    },
  },
  {
    name: 'orchestrate.run',
    description: 'Run a flow with orchestration',
    category: 'orchestration',
    inputSchema: {
      type: 'object',
      properties: {
        flowId: { type: 'string' },
        goal: { type: 'string' },
        context: { type: 'string' },
      },
      required: ['flowId', 'goal'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        runId: { type: 'string' },
        status: { type: 'string' },
        result: { type: 'object' },
      },
    },
  },
  {
    name: 'exec.run',
    description: 'Execute a command or tool',
    category: 'execution',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        args: { type: 'array' },
      },
      required: ['command'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        output: { type: 'string' },
        exitCode: { type: 'number' },
      },
    },
  },
];

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  await new Promise<void>((r) => req.on('end', () => r()));
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return {};
  }
}

function executeMcpTool(toolName: string, input: any): any {
  switch (toolName) {
    case 'modes.list':
      return {
        modes: ['api-designer', 'code-reviewer', 'ux-designer', 'security-expert'],
        count: 4,
      };

    case 'agents.plan':
      return {
        plan: {
          goal: input.goal,
          steps: [
            { step: 1, action: 'Analyze requirements' },
            { step: 2, action: 'Create design' },
            { step: 3, action: 'Validate design' },
          ],
        },
        steps: 3,
      };

    case 'orchestrate.run':
      return {
        runId: `run-${Date.now()}`,
        status: 'completed',
        result: { success: true },
      };

    case 'exec.run':
      return {
        output: 'Command executed successfully',
        exitCode: 0,
      };

    default:
      return { error: 'Unknown tool' };
  }
}

export async function handleMcpRequest(
  pathname: string,
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  // GET /mcp/tools
  if (pathname === '/mcp/tools' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        tools: mcpToolsRegistry,
        count: mcpToolsRegistry.length,
      })
    );
    return true;
  }

  // GET /mcp/tools/:name
  if (pathname.startsWith('/mcp/tools/') && req.method === 'GET') {
    const name = pathname.split('/').pop();
    const tool = mcpToolsRegistry.find((t) => t.name === name);
    if (!tool) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Tool not found' }));
      return true;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, tool }));
    return true;
  }

  // POST /mcp/call
  if (pathname === '/mcp/call' && req.method === 'POST') {
    const body = await readBody(req);
    const { tool, input } = body;

    if (!tool) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Missing tool name' }));
      return true;
    }

    const toolDef = mcpToolsRegistry.find((t) => t.name === tool);
    if (!toolDef) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: `Tool ${tool} not found` }));
      return true;
    }

    const result = executeMcpTool(tool, input);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, tool, input, result }));
    return true;
  }

  // GET /mcp/flows
  if (pathname === '/mcp/flows' && req.method === 'GET') {
    const flows = Array.from(flowRegistry.values()).map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      pattern: f.pattern,
      nodeCount: f.nodes.length,
    }));

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        flows,
        count: flows.length,
      })
    );
    return true;
  }

  // GET /mcp/flows/:id
  if (pathname.startsWith('/mcp/flows/') && req.method === 'GET' && !pathname.includes('/simulate') && !pathname.includes('/events')) {
    const id = pathname.split('/')[3];
    const flow = flowRegistry.get(id);
    if (!flow) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Flow not found' }));
      return true;
    }

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        flow: {
          id: flow.id,
          name: flow.name,
          description: flow.description,
          pattern: flow.pattern,
          nodes: flow.nodes.map((n: any) => ({
            id: n.getId(),
            role: n.getRole(),
          })),
          edges: flow.edges,
        },
      })
    );
    return true;
  }

  // POST /mcp/flows/:id/simulate
  if (pathname.includes('/mcp/flows/') && pathname.includes('/simulate') && req.method === 'POST') {
    const id = pathname.split('/')[3];
    const flow = flowRegistry.get(id);
    if (!flow) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Flow not found' }));
      return true;
    }

    const simulation = {
      flowId: flow.id,
      pattern: flow.pattern,
      nodes: flow.nodes.map((n: any) => ({
        id: n.getId(),
        role: n.getRole(),
        status: 'pending',
      })),
      edges: flow.edges,
      estimatedDuration: '~30s',
      estimatedTokens: 5000,
      parallelGroups: flow.pattern === 'parallel' ? [flow.nodes.map((n: any) => n.getId())] : null,
    };

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        simulation,
      })
    );
    return true;
  }

  // POST /mcp/runs
  if (pathname === '/mcp/runs' && req.method === 'POST') {
    const body = await readBody(req);
    const { flowId, goal, context } = body;

    if (!flowId || !goal) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Missing flowId or goal' }));
      return true;
    }

    const flow = flowRegistry.get(flowId);
    if (!flow) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Flow not found' }));
      return true;
    }

    const store = new Store({
      task: {
        goal,
        context: context || '',
      },
    });

    const runId = `run-${flowId}-${Date.now()}`;
    const mockResult = {
      flowId,
      runId,
      status: 'completed',
      nodeResults: new Map(),
      store,
      duration: 5000,
      timestamp: new Date(),
    };

    activeRuns.set(runId, mockResult);

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        run: {
          runId,
          flowId,
          status: 'running',
          createdAt: new Date(),
        },
      })
    );
    return true;
  }

  // GET /mcp/runs
  if (pathname === '/mcp/runs' && req.method === 'GET') {
    const runs = Array.from(activeRuns.values()).map((r) => ({
      runId: r.runId,
      flowId: r.flowId,
      status: r.status,
      duration: r.duration,
      timestamp: r.timestamp,
    }));

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        runs,
        count: runs.length,
      })
    );
    return true;
  }

  // GET /mcp/runs/:id
  if (pathname.startsWith('/mcp/runs/') && req.method === 'GET' && !pathname.includes('/events')) {
    const id = pathname.split('/')[3];
    const run = activeRuns.get(id);
    if (!run) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Run not found' }));
      return true;
    }

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        run: {
          runId: run.runId,
          flowId: run.flowId,
          status: run.status,
          duration: run.duration,
          timestamp: run.timestamp,
          nodeResults: Array.from(run.nodeResults.entries()).map(([nodeId, result]: any) => ({
            nodeId,
            status: result.status,
            error: result.error,
            retryCount: result.retryCount,
          })),
          store: run.store.get(),
        },
      })
    );
    return true;
  }

  // GET /mcp/runs/:id/events (SSE)
  if (pathname.includes('/mcp/runs/') && pathname.includes('/events') && req.method === 'GET') {
    const id = pathname.split('/')[3];
    const run = activeRuns.get(id);
    if (!run) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Run not found' }));
      return true;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'run_started', runId: run.runId })}\n\n`);

    const events = [
      { type: 'node_started', nodeId: 'plan-api', timestamp: Date.now() },
      { type: 'node_completed', nodeId: 'plan-api', timestamp: Date.now() + 1000 },
      { type: 'node_started', nodeId: 'validate-api', timestamp: Date.now() + 2000 },
      { type: 'node_completed', nodeId: 'validate-api', timestamp: Date.now() + 3000 },
      { type: 'run_completed', status: 'completed', timestamp: Date.now() + 4000 },
    ];

    let eventIndex = 0;
    const interval = setInterval(() => {
      if (eventIndex < events.length) {
        res.write(`data: ${JSON.stringify(events[eventIndex])}\n\n`);
        eventIndex++;
      } else {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    return true;
  }

  return false;
}
