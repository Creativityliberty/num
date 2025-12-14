import type { AgentTask } from './queue.js';
export interface ProcessorConfig {
    validateOnly?: boolean;
    dryRun?: boolean;
}
export declare class AgentProcessor {
    private config;
    constructor(config?: ProcessorConfig);
    processAgent(task: AgentTask): Promise<void>;
    private validateYaml;
    private validateAgentStructure;
    private validateUniqueTrigger;
    private validatePersona;
    private validateCriticalActions;
    private validateMenu;
}
