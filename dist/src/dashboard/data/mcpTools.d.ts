export type McpTool = {
    name: string;
    description: string;
    category: string;
    inputSchema: Record<string, unknown>;
    examples?: Array<{
        title: string;
        input: unknown;
        output?: unknown;
    }>;
};
export declare const MCP_TOOLS: McpTool[];
export declare function getToolsByCategory(category: string): McpTool[];
export declare function getToolByName(name: string): McpTool | undefined;
export declare function getAllCategories(): string[];
