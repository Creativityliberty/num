import type { AgentProcessor } from './processor.js';
import type { AgentQueue } from './queue.js';
export interface WorkerConfig {
    id: number;
    queue: AgentQueue;
    processor: AgentProcessor;
}
export declare class Worker {
    private id;
    private queue;
    private processor;
    private isRunning;
    private processedTasks;
    constructor(config: WorkerConfig);
    start(): Promise<void>;
    stop(): void;
    getProcessedCount(): number;
}
export declare class WorkerPool {
    private poolSize;
    private queue;
    private processor;
    private workers;
    private workerPromises;
    constructor(poolSize: number, queue: AgentQueue, processor: AgentProcessor);
    private initializeWorkers;
    run(): Promise<void>;
    stopAll(): void;
}
