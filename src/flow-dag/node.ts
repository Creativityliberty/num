import type { z } from 'zod';
import type { Store } from './store.js';

export interface NodeConfig {
  id: string;
  role: string;
  goal: string;
  promptTemplate: string;
  expectedSchema: z.ZodSchema;
  retryPolicy?: {
    maxRetries?: number;
    onlyOnInvalidJSON?: boolean;
  };
  gates?: {
    requires?: ('exec' | 'write' | 'git' | 'confirmations')[];
  };
  actions?: ('ok' | 'retry' | 'blocked' | 'fail')[];
}

export interface NodeContext {
  store: Store;
  llmCall: (prompt: string, schema: z.ZodSchema) => Promise<any>;
  toolCall: (toolName: string, input: any) => Promise<any>;
}

export interface NodeResult {
  status: 'ok' | 'retry' | 'blocked' | 'fail';
  output?: any;
  error?: string;
  retryCount?: number;
}

export class Node {
  private config: NodeConfig;
  private retryCount: number = 0;

  constructor(config: NodeConfig) {
    this.config = {
      retryPolicy: {
        maxRetries: 2,
        onlyOnInvalidJSON: true,
      },
      gates: {
        requires: [],
      },
      actions: ['ok', 'retry', 'blocked', 'fail'],
      ...config,
    };
  }

  async execute(context: NodeContext): Promise<NodeResult> {
    const { store, llmCall, toolCall } = context;

    try {
      // PREP phase
      const prepResult = await this.prep(store);
      if (!prepResult.ok) {
        return { status: 'blocked', error: prepResult.error };
      }

      // Check gates
      const gateCheck = this.checkGates(store);
      if (!gateCheck.ok) {
        store.markNodeBlocked(this.config.id);
        return { status: 'blocked', error: gateCheck.error };
      }

      // EXEC phase
      const prompt = this.buildPrompt(store);
      let output: any;
      let lastError: string | null = null;

      for (let attempt = 0; attempt <= (this.config.retryPolicy?.maxRetries || 2); attempt++) {
        try {
          output = await llmCall(prompt, this.config.expectedSchema);
          this.retryCount = attempt;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          if (attempt < (this.config.retryPolicy?.maxRetries || 2)) {
            console.log(`⏳ Node ${this.config.id}: Retry ${attempt + 1}/${this.config.retryPolicy?.maxRetries}`);
          }
        }
      }

      if (!output) {
        store.markNodeFailed(this.config.id);
        return { status: 'fail', error: lastError || 'LLM call failed', retryCount: this.retryCount };
      }

      // POST phase
      const postResult = await this.post(store, output);
      if (!postResult.ok) {
        return { status: 'fail', error: postResult.error };
      }

      // Success
      store.markNodeCompleted(this.config.id);
      return { status: 'ok', output, retryCount: this.retryCount };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      store.markNodeFailed(this.config.id);
      return { status: 'fail', error: errorMsg };
    }
  }

  private async prep(store: Store): Promise<{ ok: boolean; error?: string }> {
    // Validate that required artifacts exist
    const state = store.getState();
    if (state.status === 'blocked') {
      return { ok: false, error: 'Store is blocked' };
    }
    return { ok: true };
  }

  private checkGates(store: Store): { ok: boolean; error?: string } {
    const policy = store.get().policySnapshot;
    const requiredTools = this.config.gates?.requires || [];

    for (const tool of requiredTools) {
      if (policy.blockedTools.includes(tool)) {
        return { ok: false, error: `Tool ${tool} is blocked by policy` };
      }
    }

    return { ok: true };
  }

  private buildPrompt(store: Store): string {
    const storeData = store.get();
    const context = JSON.stringify(storeData.artifacts, null, 2);

    return this.config.promptTemplate
      .replace('{{GOAL}}', this.config.goal)
      .replace('{{ROLE}}', this.config.role)
      .replace('{{CONTEXT}}', context);
  }

  private async post(store: Store, output: any): Promise<{ ok: boolean; error?: string }> {
    // Validate output against expected schema
    try {
      const validated = this.config.expectedSchema.parse(output);
      // Store the output as an artifact
      const artifactKey = `${this.config.id}_output` as any;
      store.setArtifact(artifactKey, validated);
      return { ok: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { ok: false, error: `Validation failed: ${errorMsg}` };
    }
  }

  getId(): string {
    return this.config.id;
  }

  getRole(): string {
    return this.config.role;
  }
}
