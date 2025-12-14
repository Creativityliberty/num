export interface AgentTask {
    id: string;
    agentId: string;
    filePath: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    startTime?: number;
    endTime?: number;
}
export declare class AgentQueue {
    private customModesDir;
    private tasks;
    private queue;
    constructor(customModesDir: string);
    private discoverAgents;
    getNextTask(): AgentTask | null;
    completeTask(taskId: string): void;
    failTask(taskId: string, error: string): void;
    getStats(): {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    };
    getAllTasks(): AgentTask[];
}
