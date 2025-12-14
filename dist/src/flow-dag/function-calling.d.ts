export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
    };
}
export interface FunctionCall {
    name: string;
    args: Record<string, any>;
}
export declare class FunctionRegistry {
    private functions;
    private declarations;
    register(declaration: FunctionDeclaration, implementation: Function): void;
    getDeclaration(name: string): FunctionDeclaration | undefined;
    getAllDeclarations(): FunctionDeclaration[];
    execute(call: FunctionCall): Promise<any>;
    executeMultiple(calls: FunctionCall[]): Promise<Record<string, any>>;
}
export declare const builtInTools: {
    get_current_time: () => Promise<{
        timestamp: string;
    }>;
    search_knowledge_base: (args: {
        query: string;
        limit?: number;
    }) => Promise<{
        results: {
            id: string;
            title: string;
            content: string;
        }[];
        total: number;
    }>;
    get_agent_status: (args: {
        agent_id: string;
    }) => Promise<{
        agent_id: string;
        status: string;
        uptime_seconds: number;
    }>;
    execute_command: (args: {
        command: string;
        timeout?: number;
    }) => Promise<{
        command: string;
        exit_code: number;
        stdout: string;
        stderr: string;
    }>;
    store_artifact: (args: {
        key: string;
        value: any;
        ttl?: number;
    }) => Promise<{
        key: string;
        stored: boolean;
        ttl: number;
    }>;
    retrieve_artifact: (args: {
        key: string;
    }) => Promise<{
        key: string;
        value: any;
        found: boolean;
    }>;
    call_agent: (args: {
        agent_id: string;
        prompt: string;
    }) => Promise<{
        agent_id: string;
        response: string;
    }>;
    log_message: (args: {
        level: "info" | "warn" | "error";
        message: string;
    }) => Promise<{
        logged: boolean;
    }>;
};
export declare function createBuiltInDeclarations(): FunctionDeclaration[];
export declare class FunctionCallingHandler {
    private registry;
    constructor(registry?: FunctionRegistry);
    private initializeBuiltInTools;
    getDeclarations(): FunctionDeclaration[];
    handleFunctionCalls(functionCalls: FunctionCall[], maxIterations?: number): Promise<Record<string, any>>;
    registerCustomFunction(declaration: FunctionDeclaration, implementation: Function): void;
}
export declare function createFunctionCallingHandler(): FunctionCallingHandler;
