import type { FlowDefinition } from './runner.js';
export declare const numflowPhase1Analysis: FlowDefinition;
export declare const numflowPhase2Planning: FlowDefinition;
export declare const numflowPhase3Solutioning: FlowDefinition;
export declare const numflowPhase4Implementation: FlowDefinition;
export declare class NumFlowOrchestrator {
    private phases;
    getPhase(index: number): FlowDefinition | null;
    getAllPhases(): FlowDefinition[];
    getPhaseByName(name: string): FlowDefinition | null;
    getPhaseCount(): number;
    getNextPhase(currentPhaseId: string): FlowDefinition | null;
}
