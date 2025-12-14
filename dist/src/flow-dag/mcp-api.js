import { apiDesignFlowDefinition, codeReviewFlowDefinition, uxDesignFlowDefinition, } from './examples.js';
import { Store } from './store.js';
// In-memory storage for runs (in production, use database)
const activeRuns = new Map();
const flowRegistry = new Map([
    ['api-design-flow', apiDesignFlowDefinition],
    ['code-review-flow', codeReviewFlowDefinition],
    ['ux-design-flow', uxDesignFlowDefinition],
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
export function setupMcpApi(app) {
    // GET /mcp/tools - List all MCP tools
    app.get('/mcp/tools', (req, res) => {
        res.json({
            ok: true,
            tools: mcpToolsRegistry,
            count: mcpToolsRegistry.length,
        });
    });
    // GET /mcp/tools/:name - Get tool details
    app.get('/mcp/tools/:name', (req, res) => {
        const tool = mcpToolsRegistry.find(t => t.name === req.params.name);
        if (!tool) {
            return res.status(404).json({ ok: false, error: 'Tool not found' });
        }
        res.json({ ok: true, tool });
    });
    // POST /mcp/call - Call a tool
    app.post('/mcp/call', (req, res) => {
        const { tool, input } = req.body;
        if (!tool) {
            return res.status(400).json({ ok: false, error: 'Missing tool name' });
        }
        const toolDef = mcpToolsRegistry.find(t => t.name === tool);
        if (!toolDef) {
            return res.status(404).json({ ok: false, error: `Tool ${tool} not found` });
        }
        // Mock tool execution
        const result = executeMcpTool(tool, input);
        res.json({ ok: true, tool, input, result });
    });
    // GET /mcp/flows - List all flows
    app.get('/mcp/flows', (req, res) => {
        const flows = Array.from(flowRegistry.values()).map(f => ({
            id: f.id,
            name: f.name,
            description: f.description,
            pattern: f.pattern,
            nodeCount: f.nodes.length,
        }));
        res.json({
            ok: true,
            flows,
            count: flows.length,
        });
    });
    // GET /mcp/flows/:id - Get flow details
    app.get('/mcp/flows/:id', (req, res) => {
        const flow = flowRegistry.get(req.params.id);
        if (!flow) {
            return res.status(404).json({ ok: false, error: 'Flow not found' });
        }
        res.json({
            ok: true,
            flow: {
                id: flow.id,
                name: flow.name,
                description: flow.description,
                pattern: flow.pattern,
                nodes: flow.nodes.map(n => ({
                    id: n.getId(),
                    role: n.getRole(),
                })),
                edges: flow.edges,
            },
        });
    });
    // POST /mcp/flows/:id/simulate - Simulate a flow (dry-run)
    app.post('/mcp/flows/:id/simulate', (req, res) => {
        const flow = flowRegistry.get(req.params.id);
        if (!flow) {
            return res.status(404).json({ ok: false, error: 'Flow not found' });
        }
        const { goal, context } = req.body;
        // Simulate the flow execution
        const simulation = {
            flowId: flow.id,
            pattern: flow.pattern,
            nodes: flow.nodes.map(n => ({
                id: n.getId(),
                role: n.getRole(),
                status: 'pending',
            })),
            edges: flow.edges,
            estimatedDuration: '~30s',
            estimatedTokens: 5000,
            parallelGroups: flow.pattern === 'parallel' ? [flow.nodes.map(n => n.getId())] : null,
        };
        res.json({
            ok: true,
            simulation,
        });
    });
    // POST /mcp/runs - Start a new run
    app.post('/mcp/runs', (req, res) => {
        const { flowId, goal, context } = req.body;
        if (!flowId || !goal) {
            return res.status(400).json({ ok: false, error: 'Missing flowId or goal' });
        }
        const flow = flowRegistry.get(flowId);
        if (!flow) {
            return res.status(404).json({ ok: false, error: 'Flow not found' });
        }
        const store = new Store({
            task: {
                goal,
                context: context || '',
            },
        });
        const runId = `run-${flowId}-${Date.now()}`;
        // Mock run execution (in production, would actually run the flow)
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
        res.json({
            ok: true,
            run: {
                runId,
                flowId,
                status: 'running',
                createdAt: new Date(),
            },
        });
    });
    // GET /mcp/runs - List all runs
    app.get('/mcp/runs', (req, res) => {
        const runs = Array.from(activeRuns.values()).map(r => ({
            runId: r.runId,
            flowId: r.flowId,
            status: r.status,
            duration: r.duration,
            timestamp: r.timestamp,
        }));
        res.json({
            ok: true,
            runs,
            count: runs.length,
        });
    });
    // GET /mcp/runs/:id - Get run details
    app.get('/mcp/runs/:id', (req, res) => {
        const run = activeRuns.get(req.params.id);
        if (!run) {
            return res.status(404).json({ ok: false, error: 'Run not found' });
        }
        res.json({
            ok: true,
            run: {
                runId: run.runId,
                flowId: run.flowId,
                status: run.status,
                duration: run.duration,
                timestamp: run.timestamp,
                nodeResults: Array.from(run.nodeResults.entries()).map(([nodeId, result]) => ({
                    nodeId,
                    status: result.status,
                    error: result.error,
                    retryCount: result.retryCount,
                })),
                store: run.store.get(),
            },
        });
    });
    // GET /mcp/runs/:id/events - Stream run events (SSE)
    app.get('/mcp/runs/:id/events', (req, res) => {
        const run = activeRuns.get(req.params.id);
        if (!run) {
            return res.status(404).json({ ok: false, error: 'Run not found' });
        }
        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Send initial event
        res.write(`data: ${JSON.stringify({ type: 'run_started', runId: run.runId })}\n\n`);
        // Mock events
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
            }
            else {
                clearInterval(interval);
                res.end();
            }
        }, 1000);
    });
}
// Helper function to execute MCP tools
function executeMcpTool(toolName, input) {
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
