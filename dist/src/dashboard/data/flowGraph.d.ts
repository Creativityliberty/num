export type FlowNode = {
    id: string;
    type: "role" | "action" | "decision" | "start" | "end";
    label: string;
    x?: number;
    y?: number;
    color?: string;
};
export type FlowEdge = {
    id: string;
    source: string;
    target: string;
    label?: string;
};
export type FlowGraph = {
    nodes: FlowNode[];
    edges: FlowEdge[];
    title?: string;
};
export declare function generateFlowGraph(mode: Record<string, unknown>): FlowGraph;
export declare function generateSVG(graph: FlowGraph): string;
export declare function calculateLayout(graph: FlowGraph): FlowGraph;
