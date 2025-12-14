import { z } from "zod";
import { zodToJsonSchema, type JsonSchema } from "./jsonschema.js";

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

export class McpServer {
  private tools = new Map<
    string,
    {
      name: string;
      description?: string;
      inputSchema: z.ZodTypeAny;
      inputJsonSchema: JsonSchema;
      outputJsonSchema?: JsonSchema;
      examples?: ToolExample[];
      handler: ToolHandler;
    }
  >();

  constructor() {}

  tool(
    name: string,
    description: string,
    schema: z.ZodTypeAny,
    handler: ToolHandler,
    meta?: ToolMeta
  ) {
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

  listTools(): Array<{
    name: string;
    description?: string;
    inputSchema: JsonSchema;
    outputSchema?: JsonSchema;
    hasExamples: boolean;
  }> {
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

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getToolMeta(name: string): {
    name: string;
    description?: string;
    inputSchema: JsonSchema;
    outputSchema?: JsonSchema;
    examples: ToolExample[];
  } | null {
    const t = this.tools.get(name);
    if (!t) return null;
    return {
      name: t.name,
      description: t.description,
      inputSchema: t.inputJsonSchema,
      outputSchema: t.outputJsonSchema,
      examples: t.examples ?? [],
    };
  }

  async callToolJSON(name: string, input: unknown, ctx?: unknown): Promise<unknown> {
    const t = this.tools.get(name);
    if (!t) {
      const err: Error & { code?: string } = new Error(`UNKNOWN_TOOL: ${name}`);
      err.code = "UNKNOWN_TOOL";
      throw err;
    }
    const parsed = t.inputSchema.parse(input ?? {});
    return await t.handler(parsed, ctx);
  }
}
