export interface HandlerAccessTest {
    handlerName: string;
    agentName: string;
    hasAccess: boolean;
    canInitialize: boolean;
    canExecute: boolean;
    error?: string;
    duration: number;
}
export interface SystemIntegrationResult {
    agentName: string;
    totalHandlers: number;
    accessibleHandlers: number;
    failedHandlers: number;
    handlers: HandlerAccessTest[];
    overallSuccess: boolean;
    duration: number;
}
export declare class SystemIntegrationTester {
    private apiKey;
    private handlers;
    private agents;
    constructor(apiKey: string);
    testHandlerAccessForAgent(agentName: string): Promise<SystemIntegrationResult>;
    testAllAgents(): Promise<SystemIntegrationResult[]>;
    private simulateHandlerInitialization;
    private simulateHandlerExecution;
    printResults(results: SystemIntegrationResult[]): void;
    getAccessMatrix(results: SystemIntegrationResult[]): Record<string, Record<string, boolean>>;
    printAccessMatrix(results: SystemIntegrationResult[]): void;
}
export declare function runSystemIntegrationTest(apiKey: string): Promise<void>;
