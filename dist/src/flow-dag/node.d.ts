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
export declare class Node {
    private config;
    private retryCount;
    constructor(config: NodeConfig);
    execute(context: NodeContext): Promise<NodeResult>;
    private prep;
    private checkGates;
    private buildPrompt;
    private post;
    getId(): string;
    getRole(): string;
}
