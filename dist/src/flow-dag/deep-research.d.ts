export interface ResearchTask {
    input: string;
    agent: string;
    background: boolean;
    stream?: boolean;
    tools?: ResearchTool[];
    agentConfig?: AgentConfig;
}
export interface ResearchTool {
    type: 'google_search' | 'url_context' | 'file_search';
    fileSearchStoreNames?: string[];
}
export interface AgentConfig {
    type: 'deep-research';
    thinkingSummaries?: 'auto' | 'manual' | 'disabled';
}
export interface Interaction {
    id: string;
    status: 'in_progress' | 'completed' | 'failed';
    input: string;
    outputs: Array<{
        text: string;
        type: string;
    }>;
    error?: string;
    createdTime?: string;
    completedTime?: string;
}
export interface ResearchEvent {
    eventType: 'interaction.start' | 'content.delta' | 'interaction.complete' | 'error';
    eventId?: string;
    interaction?: Interaction;
    delta?: {
        type: 'text' | 'thought_summary';
        text?: string;
        content?: {
            text: string;
        };
    };
}
export interface ResearchOutput {
    summary: string;
    sections: Array<{
        title: string;
        content: string;
    }>;
    citations: Array<{
        source: string;
        url?: string;
    }>;
    thinkingProcess?: string;
}
export declare class ResearchTaskManager {
    private tasks;
    private taskCounter;
    createTask(input: string): Interaction;
    getTask(id: string): Interaction | undefined;
    updateTaskStatus(id: string, status: Interaction['status'], error?: string): void;
    addOutput(id: string, text: string, type?: string): void;
    listTasks(): Interaction[];
    getTaskCount(): number;
}
export declare class ResearchWorkflowExecutor {
    private taskManager;
    constructor();
    executeResearch(task: ResearchTask): Promise<Interaction>;
    private synthesizeResearch;
    getTaskManager(): ResearchTaskManager;
}
export declare class ResearchSteerability {
    formatOutput(content: string, format: 'technical' | 'executive' | 'casual'): string;
    structureReport(sections: string[]): string;
    createDataTable(headers: string[], rows: string[][]): string;
}
export declare class DeepResearchAgentHandler {
    private workflowExecutor;
    private steerability;
    private maxResearchTime;
    constructor();
    startResearch(task: ResearchTask): Promise<Interaction>;
    getResearchStatus(interactionId: string): Interaction | undefined;
    listResearchTasks(): Interaction[];
    formatResearchOutput(content: string, format: 'technical' | 'executive' | 'casual'): string;
    createStructuredReport(title: string, sections: string[]): string;
    createDataTable(headers: string[], rows: string[][]): string;
    getUseCases(): Record<string, string[]>;
    getBestPractices(): string[];
    getLimitations(): string[];
    getSafetyConsiderations(): Record<string, string>;
    getComparison(): Record<string, Record<string, string>>;
    getComprehensiveStats(): {
        taskCount: number;
        useCases: Record<string, string[]>;
        bestPractices: string[];
        limitations: string[];
        safetyConsiderations: Record<string, string>;
        comparison: Record<string, Record<string, string>>;
        maxResearchTime: number;
    };
}
export declare function createDeepResearchAgentHandler(): DeepResearchAgentHandler;
