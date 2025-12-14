export type ValidationError = {
    type: "PARSE" | "NO_FLOW" | "CYCLE" | "SCHEMA_MISMATCH" | "EDGE_INVALID" | "NODE_DUPLICATE" | "CATALOG" | "REPO";
    message: string;
    nodeId?: string;
};
export type ModeSummary = {
    id: string;
    name?: string;
    description?: string;
    tags?: string[];
    hasFlow: boolean;
    flowName?: string;
    nodeCount?: number;
    edgeCount?: number;
    status: "OK" | "INVALID" | "CYCLE" | "SCHEMA_MISMATCH";
    errors?: ValidationError[];
    topo?: string[][];
    source?: "FILE" | "CATALOG" | "REPO";
    pack?: {
        id: string;
        version?: string;
    };
};
export type ModeDetail = ModeSummary & {
    flow?: any;
    nodes?: {
        id: string;
        role: string;
        goal: string;
        expectedSchema: string;
    }[];
};
export declare class ModesRegistry {
    private opts;
    constructor(opts: {
        modesPath: string;
        catalogPath?: string;
        repoPath?: string;
    });
    private readModeFile;
    list(): Promise<ModeSummary[]>;
    get(id: string): Promise<ModeDetail | null>;
    validate(id: string): Promise<{
        ok: boolean;
        errors: ValidationError[];
        topo?: string[][];
    }>;
    simulate(id: string): Promise<{
        ok: boolean;
        ticks: string[][];
        blockedBy: Record<string, string[]>;
        parallel: string[][];
    } | {
        ok: false;
        error: string;
    }>;
    private validateFlow;
}
export declare function topoGroups(spec: any): string[][];
