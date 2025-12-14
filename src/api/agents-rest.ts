import type { Express, Request, Response } from 'express';
import type { Policy } from '../core/policy.js';
import type { EventBus } from '../obs/events.js';

export interface AgentExecutionRequest {
  agentId: string;
  modeId?: string;
  input: Record<string, unknown>;
  timeout?: number;
}

export interface AgentExecutionResponse {
  executionId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

const executions = new Map<string, AgentExecutionResponse>();

function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function setupAgentsRestAPI(app: Express, bus: EventBus, policy: Policy): void {
  // List all available agents
  app.get('/api/agents', (req: Request, res: Response) => {
    const agents = [
      {
        id: 'analysis-agent',
        name: 'Analysis Agent',
        description: 'Analyzes data and text',
        tags: ['analysis', 'data'],
      },
      {
        id: 'planning-agent',
        name: 'Planning Agent',
        description: 'Plans and orchestrates workflows',
        tags: ['planning', 'orchestration'],
      },
      {
        id: 'solutioning-agent',
        name: 'Solutioning Agent',
        description: 'Generates solutions and ideas',
        tags: ['solution', 'brainstorm'],
      },
      {
        id: 'implementation-agent',
        name: 'Implementation Agent',
        description: 'Executes and implements solutions',
        tags: ['implementation', 'execution'],
      },
    ];

    res.json({
      total: agents.length,
      agents,
    });
  });

  // Get agent details
  app.get('/api/agents/:agentId', (req: Request, res: Response) => {
    const { agentId } = req.params;

    const agentDetails: Record<string, unknown> = {
      'analysis-agent': {
        id: 'analysis-agent',
        name: 'Analysis Agent',
        description: 'Analyzes data and text',
        tags: ['analysis', 'data'],
        capabilities: ['text-analysis', 'data-processing', 'summarization'],
        handlers: ['LLMHandler', 'EmbeddingsRAGHandler'],
      },
      'planning-agent': {
        id: 'planning-agent',
        name: 'Planning Agent',
        description: 'Plans and orchestrates workflows',
        tags: ['planning', 'orchestration'],
        capabilities: ['workflow-planning', 'task-decomposition', 'scheduling'],
        handlers: ['LLMHandler', 'FunctionCallingHandler'],
      },
      'solutioning-agent': {
        id: 'solutioning-agent',
        name: 'Solutioning Agent',
        description: 'Generates solutions and ideas',
        tags: ['solution', 'brainstorm'],
        capabilities: ['ideation', 'solution-design', 'problem-solving'],
        handlers: ['LLMHandler', 'DeepResearchAgentHandler'],
      },
      'implementation-agent': {
        id: 'implementation-agent',
        name: 'Implementation Agent',
        description: 'Executes and implements solutions',
        tags: ['implementation', 'execution'],
        capabilities: ['code-execution', 'deployment', 'automation'],
        handlers: ['FunctionCallingHandler', 'ComputerUseHandler'],
      },
    };

    const details = agentDetails[agentId];
    if (!details) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(details);
  });

  // Execute an agent
  app.post('/api/agents/execute', async (req: Request, res: Response) => {
    try {
      const { agentId, modeId, input, timeout } = req.body as AgentExecutionRequest;

      if (!agentId) {
        return res.status(400).json({ error: 'agentId is required' });
      }

      if (!input) {
        return res.status(400).json({ error: 'input is required' });
      }

      const executionId = generateExecutionId();
      const execution: AgentExecutionResponse = {
        executionId,
        agentId,
        status: 'pending',
        startedAt: new Date().toISOString(),
      };

      executions.set(executionId, execution);

      // Simulate async execution
      setImmediate(async () => {
        try {
          execution.status = 'running';

          // Simulate agent processing
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Generate mock result based on agent type
          const result = generateAgentResult(agentId, input);

          execution.status = 'completed';
          execution.result = result;
          execution.completedAt = new Date().toISOString();

          // Log execution event
          (bus as any).record?.({
            type: 'agent.executed',
            data: {
              executionId,
              agentId,
              status: 'completed',
              duration: Date.now() - new Date(execution.startedAt).getTime(),
            },
          });
        } catch (error) {
          execution.status = 'failed';
          execution.error = error instanceof Error ? error.message : 'Unknown error';
          execution.completedAt = new Date().toISOString();

          (bus as any).record?.({
            type: 'agent.failed',
            data: {
              executionId,
              agentId,
              error: execution.error,
            },
          });
        }
      });

      res.status(202).json(execution);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  // Get execution status
  app.get('/api/agents/executions/:executionId', (req: Request, res: Response) => {
    const { executionId } = req.params;
    const execution = executions.get(executionId);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  });

  // List all executions
  app.get('/api/agents/executions', (req: Request, res: Response) => {
    const allExecutions = Array.from(executions.values());
    res.json({
      total: allExecutions.length,
      executions: allExecutions,
    });
  });

  // Cancel execution
  app.post('/api/agents/executions/:executionId/cancel', (req: Request, res: Response) => {
    const { executionId } = req.params;
    const execution = executions.get(executionId);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed execution' });
    }

    execution.status = 'failed';
    execution.error = 'Cancelled by user';
    execution.completedAt = new Date().toISOString();

    res.json(execution);
  });
}

function generateAgentResult(agentId: string, input: Record<string, unknown>): unknown {
  const results: Record<string, unknown> = {
    'analysis-agent': {
      type: 'analysis',
      input: input.task || input.text,
      summary: 'Analysis completed successfully',
      insights: [
        'Key insight 1',
        'Key insight 2',
        'Key insight 3',
      ],
      confidence: 0.92,
    },
    'planning-agent': {
      type: 'plan',
      input: input.task,
      steps: [
        { step: 1, description: 'Analyze requirements', duration: '1h' },
        { step: 2, description: 'Design solution', duration: '2h' },
        { step: 3, description: 'Implement', duration: '4h' },
        { step: 4, description: 'Test and validate', duration: '2h' },
      ],
      totalDuration: '9h',
      status: 'ready',
    },
    'solutioning-agent': {
      type: 'solution',
      input: input.task,
      solutions: [
        {
          id: 'sol_1',
          title: 'Solution 1',
          description: 'First proposed solution',
          pros: ['Pro 1', 'Pro 2'],
          cons: ['Con 1'],
          score: 8.5,
        },
        {
          id: 'sol_2',
          title: 'Solution 2',
          description: 'Alternative solution',
          pros: ['Pro 1', 'Pro 2', 'Pro 3'],
          cons: ['Con 1', 'Con 2'],
          score: 7.8,
        },
      ],
      recommended: 'sol_1',
    },
    'implementation-agent': {
      type: 'implementation',
      input: input.task,
      status: 'completed',
      output: 'Implementation executed successfully',
      artifacts: [
        { type: 'code', name: 'main.ts', lines: 150 },
        { type: 'config', name: 'config.json', size: '2.5KB' },
        { type: 'docs', name: 'README.md', size: '5.2KB' },
      ],
    },
  };

  return results[agentId] || {
    type: 'unknown',
    input,
    status: 'completed',
    message: 'Agent executed successfully',
  };
}

export default setupAgentsRestAPI;
