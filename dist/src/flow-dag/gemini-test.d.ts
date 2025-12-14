export interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    details?: Record<string, unknown>;
}
export interface TestSuite {
    name: string;
    tests: TestResult[];
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    totalDuration: number;
}
export declare class GeminiIntegrationTester {
    private apiKey;
    private results;
    constructor(apiKey: string);
    testLLMHandler(): Promise<TestSuite>;
    testFunctionCalling(): Promise<TestSuite>;
    testBatchProcessing(): Promise<TestSuite>;
    testCachingTokens(): Promise<TestSuite>;
    testLongContext(): Promise<TestSuite>;
    testEmbeddingsRAG(): Promise<TestSuite>;
    testDeepResearchAgent(): Promise<TestSuite>;
    runAllTests(): Promise<TestSuite[]>;
    getSummary(): {
        totalSuites: number;
        totalTests: number;
        totalPassed: number;
        totalFailed: number;
        totalSkipped: number;
        totalDuration: number;
        successRate: number;
    };
    printResults(): void;
}
export declare function runGeminiTests(apiKey: string): Promise<void>;
