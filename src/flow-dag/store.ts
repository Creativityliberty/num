import { z } from 'zod';

// Shared Store Schema
export const SharedStoreSchema = z.object({
  task: z.object({
    goal: z.string(),
    context: z.string(),
    id: z.string(),
    createdAt: z.date(),
  }),
  artifacts: z.object({
    plan: z.any().optional(),
    patchCandidates: z.array(z.any()).optional(),
    chosenCandidateId: z.string().optional(),
    review: z.any().optional(),
    security: z.any().optional(),
    testResults: z.any().optional(),
  }),
  telemetry: z.object({
    calls: z.array(z.object({
      nodeId: z.string(),
      provider: z.string(),
      model: z.string(),
      status: z.enum(['success', 'failed', 'timeout']),
      latency: z.number(),
      tokens: z.object({
        input: z.number(),
        output: z.number(),
      }),
      timestamp: z.date(),
    })),
  }),
  policySnapshot: z.object({
    allowedTools: z.array(z.string()),
    blockedTools: z.array(z.string()),
    requiresConfirmation: z.boolean(),
    maxTokensPerCall: z.number(),
    timeout: z.number(),
  }),
  state: z.object({
    currentNodeId: z.string().optional(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'blocked']),
    completedNodes: z.array(z.string()),
    failedNodes: z.array(z.string()),
    blockedNodes: z.array(z.string()),
  }),
});

export type SharedStore = z.infer<typeof SharedStoreSchema>;

export class Store {
  private data: SharedStore;

  constructor(initialData: Partial<SharedStore>) {
    this.data = {
      task: {
        goal: initialData.task?.goal || '',
        context: initialData.task?.context || '',
        id: initialData.task?.id || `task-${Date.now()}`,
        createdAt: initialData.task?.createdAt || new Date(),
      },
      artifacts: initialData.artifacts || {},
      telemetry: {
        calls: initialData.telemetry?.calls || [],
      },
      policySnapshot: initialData.policySnapshot || {
        allowedTools: [],
        blockedTools: [],
        requiresConfirmation: false,
        maxTokensPerCall: 4000,
        timeout: 30000,
      },
      state: {
        status: 'pending',
        completedNodes: [],
        failedNodes: [],
        blockedNodes: [],
      },
    };
  }

  // Read operations
  get(): SharedStore {
    return JSON.parse(JSON.stringify(this.data));
  }

  getArtifact(key: keyof SharedStore['artifacts']): any {
    return this.data.artifacts[key];
  }

  getState() {
    return this.data.state;
  }

  // Write operations
  setArtifact(key: keyof SharedStore['artifacts'], value: any): void {
    this.data.artifacts[key] = value;
  }

  addTelemetry(call: SharedStore['telemetry']['calls'][0]): void {
    this.data.telemetry.calls.push(call);
  }

  updateState(updates: Partial<SharedStore['state']>): void {
    this.data.state = { ...this.data.state, ...updates };
  }

  markNodeCompleted(nodeId: string): void {
    if (!this.data.state.completedNodes.includes(nodeId)) {
      this.data.state.completedNodes.push(nodeId);
    }
  }

  markNodeFailed(nodeId: string): void {
    if (!this.data.state.failedNodes.includes(nodeId)) {
      this.data.state.failedNodes.push(nodeId);
    }
  }

  markNodeBlocked(nodeId: string): void {
    if (!this.data.state.blockedNodes.includes(nodeId)) {
      this.data.state.blockedNodes.push(nodeId);
    }
  }

  // Validation
  validate(): { valid: boolean; errors: string[] } {
    try {
      SharedStoreSchema.parse(this.data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }
}
