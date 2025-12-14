import type { Node, NodeResult } from './node.js';
import type { Store } from './store.js';
export interface FlowDefinition {
    id: string;
    name: string;
    description: string;
    nodes: Node[];
    edges: Array<{
        from: string;
        to: string;
        condition?: 'ok' | 'retry' | 'blocked' | 'fail';
    }>;
    pattern: 'serial' | 'parallel' | 'consensus';
}
export interface RunResult {
    flowId: string;
    runId: string;
    status: 'completed' | 'failed' | 'blocked';
    nodeResults: Map<string, NodeResult>;
    store: Store;
    duration: number;
    timestamp: Date;
}
export declare class FlowRunner {
    private flow;
    private store;
    private nodeResults;
    private llmCall;
    private toolCall;
    constructor(flow: FlowDefinition, store: Store, llmCall: (prompt: string, schema: any) => Promise<any>, toolCall: (toolName: string, input: any) => Promise<any>);
    run(): Promise<RunResult>;
    private runSerial;
    private runParallel;
    private runConsensus;
    private findParallelGroups;
    private getFlowStatus;
}
