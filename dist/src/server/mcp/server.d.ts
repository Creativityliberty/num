import { z } from "zod";
import { type JsonSchema } from "./jsonschema.js";
type ToolHandler = (input: unknown, ctx?: unknown) => Promise<unknown>;
export type ToolExample = {
    title: string;
    input: unknown;
    output?: unknown;
};
export type ToolMeta = {
    outputSchema?: z.ZodTypeAny;
    examples?: ToolExample[];
};
export declare class McpServer {
    private tools;
    constructor();
    tool(name: string, description: string, schema: z.ZodTypeAny, handler: ToolHandler, meta?: ToolMeta): void;
    listTools(): Array<{
        name: string;
        description?: string;
        inputSchema: JsonSchema;
        outputSchema?: JsonSchema;
        hasExamples: boolean;
    }>;
    hasTool(name: string): boolean;
    getToolMeta(name: string): {
        name: string;
        description?: string;
        inputSchema: JsonSchema;
        outputSchema?: JsonSchema;
        examples: ToolExample[];
    } | null;
    callToolJSON(name: string, input: unknown, ctx?: unknown): Promise<unknown>;
}
export {};
