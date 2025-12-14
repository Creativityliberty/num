// Gemini Integration Test Suite - Complete testing for all handlers
import { createBatchProcessingHandler } from './batch-processing.js';
import { createCachingTokensHandler } from './caching-tokens.js';
import { createDeepResearchAgentHandler } from './deep-research.js';
import { createEmbeddingsRAGHandler } from './embeddings-rag.js';
import { createFunctionCallingHandler } from './function-calling.js';
import { createGeminiConfig } from './gemini-config.js';
import { createLLMHandler } from './llm-handler.js';
import { createLongContextHandler } from './long-context.js';
export class GeminiIntegrationTester {
    apiKey;
    results = [];
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    // Test LLM Handler
    async testLLMHandler() {
        const suite = {
            name: 'LLM Handler Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const config = createGeminiConfig(this.apiKey);
            const llmHandler = createLLMHandler();
            // Test 1: Initialize with Gemini
            const test1Start = Date.now();
            try {
                const initialized = config.isValidApiKey();
                suite.tests.push({
                    name: 'Initialize Gemini Config',
                    status: initialized ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                });
                if (initialized)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Initialize Gemini Config',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            // Test 2: Get model config
            const test2Start = Date.now();
            try {
                const modelConfig = config.getModelConfig('gemini-2.5-flash');
                suite.tests.push({
                    name: 'Get Model Config',
                    status: modelConfig ? 'passed' : 'failed',
                    duration: Date.now() - test2Start,
                    details: modelConfig,
                });
                if (modelConfig)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Get Model Config',
                    status: 'failed',
                    duration: Date.now() - test2Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            // Test 3: Calculate cost
            const test3Start = Date.now();
            try {
                const cost = config.calculateCost('gemini-2.5-flash', 1000, 500);
                suite.tests.push({
                    name: 'Calculate Cost',
                    status: cost > 0 ? 'passed' : 'failed',
                    duration: Date.now() - test3Start,
                    details: { cost },
                });
                if (cost > 0)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Calculate Cost',
                    status: 'failed',
                    duration: Date.now() - test3Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'LLM Handler Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Function Calling
    async testFunctionCalling() {
        const suite = {
            name: 'Function Calling Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createFunctionCallingHandler();
            // Test 1: Register function
            const test1Start = Date.now();
            try {
                const registered = handler.registerFunction({
                    name: 'test_function',
                    description: 'Test function',
                    parameters: { type: 'object', properties: {} },
                    handler: async () => ({ result: 'success' }),
                });
                suite.tests.push({
                    name: 'Register Function',
                    status: registered ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                });
                if (registered)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Register Function',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            // Test 2: Get function
            const test2Start = Date.now();
            try {
                const func = handler.getFunction('test_function');
                suite.tests.push({
                    name: 'Get Function',
                    status: func ? 'passed' : 'failed',
                    duration: Date.now() - test2Start,
                });
                if (func)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Get Function',
                    status: 'failed',
                    duration: Date.now() - test2Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Function Calling Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Batch Processing
    async testBatchProcessing() {
        const suite = {
            name: 'Batch Processing Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createBatchProcessingHandler();
            // Test 1: Create batch job
            const test1Start = Date.now();
            try {
                const job = handler.createInlineBatch('test_batch', [
                    { key: 'req1', request: { contents: [{ parts: [{ text: 'test' }] }] } },
                ]);
                suite.tests.push({
                    name: 'Create Batch Job',
                    status: job ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                    details: { jobName: job?.name },
                });
                if (job)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Create Batch Job',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Batch Processing Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Caching and Tokens
    async testCachingTokens() {
        const suite = {
            name: 'Caching & Tokens Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createCachingTokensHandler();
            // Test 1: Count tokens
            const test1Start = Date.now();
            try {
                const tokens = handler.countTokens({ text: 'Hello world' });
                suite.tests.push({
                    name: 'Count Tokens',
                    status: tokens.totalTokens > 0 ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                    details: tokens,
                });
                if (tokens.totalTokens > 0)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Count Tokens',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            // Test 2: Create cache
            const test2Start = Date.now();
            try {
                const cache = handler.createExplicitCache({
                    displayName: 'test_cache',
                });
                suite.tests.push({
                    name: 'Create Cache',
                    status: cache ? 'passed' : 'failed',
                    duration: Date.now() - test2Start,
                    details: { cacheName: cache?.name },
                });
                if (cache)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Create Cache',
                    status: 'failed',
                    duration: Date.now() - test2Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Caching & Tokens Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Long Context
    async testLongContext() {
        const suite = {
            name: 'Long Context Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createLongContextHandler();
            // Test 1: Get context window
            const test1Start = Date.now();
            try {
                const contextWindow = handler.getContextWindow('gemini-2.5-flash');
                suite.tests.push({
                    name: 'Get Context Window',
                    status: contextWindow ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                    details: contextWindow,
                });
                if (contextWindow)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Get Context Window',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Long Context Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Embeddings & RAG
    async testEmbeddingsRAG() {
        const suite = {
            name: 'Embeddings & RAG Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createEmbeddingsRAGHandler();
            // Test 1: Generate embedding
            const test1Start = Date.now();
            try {
                const embedding = handler.generateEmbedding('test text', {
                    model: 'gemini-embedding-001',
                });
                suite.tests.push({
                    name: 'Generate Embedding',
                    status: embedding && embedding.embedding.length > 0 ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                    details: { dimension: embedding?.dimension },
                });
                if (embedding && embedding.embedding.length > 0)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Generate Embedding',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Embeddings & RAG Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Test Deep Research Agent
    async testDeepResearchAgent() {
        const suite = {
            name: 'Deep Research Agent Tests',
            tests: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
        };
        try {
            const handler = createDeepResearchAgentHandler();
            // Test 1: Start research
            const test1Start = Date.now();
            try {
                const research = await handler.startResearch({
                    input: 'Test research query',
                    agent: 'deep-research-pro-preview-12-2025',
                    background: true,
                });
                suite.tests.push({
                    name: 'Start Research Task',
                    status: research ? 'passed' : 'failed',
                    duration: Date.now() - test1Start,
                    details: { interactionId: research?.id },
                });
                if (research)
                    suite.passedTests++;
                else
                    suite.failedTests++;
            }
            catch (e) {
                suite.tests.push({
                    name: 'Start Research Task',
                    status: 'failed',
                    duration: Date.now() - test1Start,
                    error: String(e),
                });
                suite.failedTests++;
            }
            suite.totalTests = suite.tests.length;
            suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0);
        }
        catch (e) {
            suite.tests.push({
                name: 'Deep Research Agent Suite',
                status: 'failed',
                duration: 0,
                error: String(e),
            });
            suite.failedTests++;
            suite.totalTests = 1;
        }
        this.results.push(suite);
        return suite;
    }
    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Gemini Integration Tests...\n');
        await this.testLLMHandler();
        await this.testFunctionCalling();
        await this.testBatchProcessing();
        await this.testCachingTokens();
        await this.testLongContext();
        await this.testEmbeddingsRAG();
        await this.testDeepResearchAgent();
        return this.results;
    }
    // Get test summary
    getSummary() {
        const summary = {
            totalSuites: this.results.length,
            totalTests: 0,
            totalPassed: 0,
            totalFailed: 0,
            totalSkipped: 0,
            totalDuration: 0,
            successRate: 0,
        };
        for (const suite of this.results) {
            summary.totalTests += suite.totalTests;
            summary.totalPassed += suite.passedTests;
            summary.totalFailed += suite.failedTests;
            summary.totalSkipped += suite.skippedTests;
            summary.totalDuration += suite.totalDuration;
        }
        summary.successRate = summary.totalTests > 0 ? (summary.totalPassed / summary.totalTests) * 100 : 0;
        return summary;
    }
    // Print results
    printResults() {
        console.log('\n📊 Test Results\n');
        console.log('='.repeat(80));
        for (const suite of this.results) {
            console.log(`\n${suite.name}`);
            console.log('-'.repeat(80));
            for (const test of suite.tests) {
                const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
                console.log(`${icon} ${test.name} (${test.duration}ms)`);
                if (test.error)
                    console.log(`   Error: ${test.error}`);
                if (test.details)
                    console.log(`   Details: ${JSON.stringify(test.details)}`);
            }
            console.log(`\nSuite Summary: ${suite.passedTests}/${suite.totalTests} passed (${suite.totalDuration}ms)`);
        }
        const summary = this.getSummary();
        console.log('\n' + '='.repeat(80));
        console.log('\n📈 Overall Summary');
        console.log('-'.repeat(80));
        console.log(`Total Suites: ${summary.totalSuites}`);
        console.log(`Total Tests: ${summary.totalTests}`);
        console.log(`Passed: ${summary.totalPassed}`);
        console.log(`Failed: ${summary.totalFailed}`);
        console.log(`Skipped: ${summary.totalSkipped}`);
        console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
        console.log(`Total Duration: ${summary.totalDuration}ms`);
        console.log('='.repeat(80) + '\n');
    }
}
// Main test execution
export async function runGeminiTests(apiKey) {
    const tester = new GeminiIntegrationTester(apiKey);
    await tester.runAllTests();
    tester.printResults();
}
//# sourceMappingURL=gemini-test.js.map