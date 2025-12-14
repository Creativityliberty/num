import type { JsonSchema } from "./jsonschema.js";
export type ToolMetaForOpenApi = {
    name: string;
    description?: string;
    inputSchema: JsonSchema;
    outputSchema?: JsonSchema;
    hasExamples?: boolean;
};
export declare function buildOpenApi(opts: {
    title: string;
    version: string;
    tools: ToolMetaForOpenApi[];
    requireAuth: boolean;
}): Record<string, unknown>;
