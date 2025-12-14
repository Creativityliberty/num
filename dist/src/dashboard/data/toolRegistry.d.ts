import { type McpTool } from "./mcpTools.js";
export type AgentToolBinding = {
    agentId: string;
    toolName: string;
    enabled: boolean;
    requiredPermissions?: string[];
};
export type ToolRegistry = {
    tools: Map<string, McpTool>;
    agentBindings: Map<string, AgentToolBinding[]>;
};
declare class ToolRegistryManager {
    private registry;
    constructor();
    private initializeTools;
    registerAgentTools(agentId: string, toolNames: string[], permissions?: string[]): void;
    getAgentTools(agentId: string): McpTool[];
    getToolsByCategory(category: string): McpTool[];
    getAllTools(): McpTool[];
    getTool(name: string): McpTool | undefined;
    getAgentBindings(agentId: string): AgentToolBinding[];
    enableToolForAgent(agentId: string, toolName: string): void;
    disableToolForAgent(agentId: string, toolName: string): void;
    getStats(): {
        totalTools: number;
        totalAgents: number;
        toolsByCategory: Record<string, number>;
    };
}
export declare const toolRegistry: ToolRegistryManager;
export declare function setupDefaultToolBindings(): void;
export {};
