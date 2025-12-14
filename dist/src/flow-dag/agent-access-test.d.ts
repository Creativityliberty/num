export interface AgentAccessResult {
    agentName: string;
    hasAccess: boolean;
    apiKeyValid: boolean;
    modelAvailable: boolean;
    testPrompt: string;
    response?: string;
    error?: string;
    duration: number;
}
export interface PromptEngineeringTest {
    name: string;
    systemInstruction: string;
    userPrompt: string;
    expectedPattern?: string;
    result?: {
        success: boolean;
        response: string;
        duration: number;
    };
}
export declare class AgentAccessTester {
    private apiKey;
    private config;
    private llmHandler;
    constructor(apiKey: string);
    testAgentAccess(agentName: string): Promise<AgentAccessResult>;
    testMultipleAgents(agentNames: string[]): Promise<AgentAccessResult[]>;
    testClearInstructions(): Promise<PromptEngineeringTest>;
    testFewShotExamples(): Promise<PromptEngineeringTest>;
    testStructuredOutput(): Promise<PromptEngineeringTest>;
    testChainOfThought(): Promise<PromptEngineeringTest>;
    testRoleBasedPrompting(): Promise<PromptEngineeringTest>;
    runPromptEngineeringTests(): Promise<PromptEngineeringTest[]>;
    printAccessResults(results: AgentAccessResult[]): void;
    printPromptEngineeringResults(tests: PromptEngineeringTest[]): void;
}
export declare function runAgentAccessAndPromptTests(apiKey: string): Promise<void>;
