import { apiDesignFlowDefinition, codeReviewFlowDefinition } from './examples.js';
import { Node } from './node.js';
import { numflowPhase1Analysis, numflowPhase2Planning, numflowPhase3Solutioning, numflowPhase4Implementation } from './numflow.js';
import { Store } from './store.js';
// Test Suite for Flow DAG System
export class FlowDAGTestSuite {
    testResults = [];
    async runAllTests() {
        console.log('\n🧪 Flow DAG Test Suite\n');
        console.log('='.repeat(60));
        await this.testStoreValidation();
        await this.testNodeExecution();
        await this.testSerialFlow();
        await this.testParallelFlow();
        await this.testRetryLogic();
        await this.testNumFlowPhases();
        this.printResults();
    }
    async testStoreValidation() {
        const testName = 'Store Validation';
        const startTime = Date.now();
        try {
            const store = new Store({
                task: {
                    goal: 'Test goal',
                    context: 'Test context',
                    id: 'test-task',
                    createdAt: new Date(),
                },
            });
            const validation = store.validate();
            if (!validation.valid) {
                throw new Error(`Store validation failed: ${validation.errors.join(', ')}`);
            }
            store.setArtifact('plan', { data: 'test' });
            const artifact = store.getArtifact('plan');
            if (!artifact || artifact.data !== 'test') {
                throw new Error('Artifact storage/retrieval failed');
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    async testNodeExecution() {
        const testName = 'Node Execution';
        const startTime = Date.now();
        try {
            const node = new Node({
                id: 'test-node',
                role: 'Test Agent',
                goal: 'Test goal',
                promptTemplate: 'Test prompt',
                expectedSchema: require('zod').z.object({ result: require('zod').z.string() }),
            });
            if (!node.getId() || node.getId() !== 'test-node') {
                throw new Error('Node ID mismatch');
            }
            if (!node.getRole() || node.getRole() !== 'Test Agent') {
                throw new Error('Node role mismatch');
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    async testSerialFlow() {
        const testName = 'Serial Flow (API Design)';
        const startTime = Date.now();
        try {
            const store = new Store({
                task: {
                    goal: 'Design a REST API',
                    context: 'E-commerce platform',
                    id: 'api-design-task',
                    createdAt: new Date(),
                },
            });
            const flow = apiDesignFlowDefinition;
            if (flow.pattern !== 'serial') {
                throw new Error('Flow pattern is not serial');
            }
            if (flow.nodes.length < 2) {
                throw new Error('Flow should have at least 2 nodes');
            }
            // Verify edges
            if (flow.edges.length === 0) {
                throw new Error('Serial flow should have edges');
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    async testParallelFlow() {
        const testName = 'Parallel Flow (Code Review)';
        const startTime = Date.now();
        try {
            const store = new Store({
                task: {
                    goal: 'Review code',
                    context: 'TypeScript backend',
                    id: 'review-task',
                    createdAt: new Date(),
                },
            });
            const flow = codeReviewFlowDefinition;
            if (flow.pattern !== 'parallel') {
                throw new Error('Flow pattern is not parallel');
            }
            if (flow.nodes.length < 3) {
                throw new Error('Code review flow should have at least 3 parallel nodes');
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    async testRetryLogic() {
        const testName = 'Retry Logic';
        const startTime = Date.now();
        try {
            const node = new Node({
                id: 'retry-test',
                role: 'Test Agent',
                goal: 'Test retry',
                promptTemplate: 'Test',
                expectedSchema: require('zod').z.object({ result: require('zod').z.string() }),
                retryPolicy: {
                    maxRetries: 3,
                    onlyOnInvalidJSON: true,
                },
            });
            // Verify retry policy is set
            const nodeConfig = node.config;
            if (!nodeConfig || !nodeConfig.retryPolicy || nodeConfig.retryPolicy.maxRetries !== 3) {
                throw new Error('Retry policy not properly configured');
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    async testNumFlowPhases() {
        const testName = 'NumFlow Phases';
        const startTime = Date.now();
        try {
            const phases = [
                { name: 'Phase 1: Analysis', flow: numflowPhase1Analysis, expectedPattern: 'parallel' },
                { name: 'Phase 2: Planning', flow: numflowPhase2Planning, expectedPattern: 'serial' },
                { name: 'Phase 3: Solutioning', flow: numflowPhase3Solutioning, expectedPattern: 'parallel' },
                { name: 'Phase 4: Implementation', flow: numflowPhase4Implementation, expectedPattern: 'serial' },
            ];
            for (const phase of phases) {
                if (phase.flow.pattern !== phase.expectedPattern) {
                    throw new Error(`${phase.name} pattern mismatch: expected ${phase.expectedPattern}, got ${phase.flow.pattern}`);
                }
                if (phase.flow.nodes.length === 0) {
                    throw new Error(`${phase.name} has no nodes`);
                }
            }
            this.recordTest(testName, 'pass', Date.now() - startTime);
        }
        catch (error) {
            this.recordTest(testName, 'fail', Date.now() - startTime, error instanceof Error ? error.message : String(error));
        }
    }
    recordTest(name, status, duration, error) {
        this.testResults.push({ name, status, duration, error });
        const icon = status === 'pass' ? '✅' : '❌';
        const errorMsg = error ? ` — ${error}` : '';
        console.log(`${icon} ${name} (${duration}ms)${errorMsg}`);
    }
    printResults() {
        console.log('\n' + '='.repeat(60));
        const passed = this.testResults.filter(r => r.status === 'pass').length;
        const failed = this.testResults.filter(r => r.status === 'fail').length;
        const total = this.testResults.length;
        const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
        console.log(`\n📊 Test Results: ${passed}/${total} passed, ${failed} failed`);
        console.log(`⏱️  Total duration: ${totalDuration}ms`);
        console.log(`✅ Success rate: ${((passed / total) * 100).toFixed(1)}%\n`);
    }
}
// Run tests
export async function runFlowDAGTests() {
    const suite = new FlowDAGTestSuite();
    await suite.runAllTests();
}
