export declare class FlowDAGTestSuite {
    private testResults;
    runAllTests(): Promise<void>;
    private testStoreValidation;
    private testNodeExecution;
    private testSerialFlow;
    private testParallelFlow;
    private testRetryLogic;
    private testNumFlowPhases;
    private recordTest;
    private printResults;
}
export declare function runFlowDAGTests(): Promise<void>;
