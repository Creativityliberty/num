import { zodToJsonSchema } from "./jsonschema.js";
export class McpServer {
    tools = new Map();
    constructor() { }
    tool(name, description, schema, handler, meta) {
        this.tools.set(name, {
            name,
            description,
            inputSchema: schema,
            inputJsonSchema: zodToJsonSchema(schema),
            outputJsonSchema: meta?.outputSchema ? zodToJsonSchema(meta.outputSchema) : undefined,
            examples: meta?.examples,
            handler,
        });
    }
    listTools() {
        return Array.from(this.tools.values())
            .map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputJsonSchema,
            outputSchema: t.outputJsonSchema,
            hasExamples: Array.isArray(t.examples) && t.examples.length > 0,
        }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    hasTool(name) {
        return this.tools.has(name);
    }
    getToolMeta(name) {
        const t = this.tools.get(name);
        if (!t)
            return null;
        return {
            name: t.name,
            description: t.description,
            inputSchema: t.inputJsonSchema,
            outputSchema: t.outputJsonSchema,
            examples: t.examples ?? [],
        };
    }
    async callToolJSON(name, input, ctx) {
        const t = this.tools.get(name);
        if (!t) {
            const err = new Error(`UNKNOWN_TOOL: ${name}`);
            err.code = "UNKNOWN_TOOL";
            throw err;
        }
        const parsed = t.inputSchema.parse(input ?? {});
        return await t.handler(parsed, ctx);
    }
}
