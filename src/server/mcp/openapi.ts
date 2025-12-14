import type { JsonSchema } from "./jsonschema.js";

export type ToolMetaForOpenApi = {
  name: string;
  description?: string;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  hasExamples?: boolean;
};

function safeComponentName(toolName: string): string {
  return toolName.replace(/[^a-zA-Z0-9]/g, "_");
}

export function buildOpenApi(opts: {
  title: string;
  version: string;
  tools: ToolMetaForOpenApi[];
  requireAuth: boolean;
}): Record<string, unknown> {
  const components: Record<string, unknown> = {
    schemas: {
      ToolCallRequest: {
        type: "object",
        properties: {
          tool: { type: "string", description: "Tool name to call" },
          input: { type: "object", description: "Tool input parameters" },
        },
        required: ["tool"],
      },
      ToolCallResponse: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          content: { type: "array", items: { type: "object" } },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      ToolMeta: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          inputSchema: { type: "object" },
          outputSchema: { type: "object" },
          examples: { type: "array", items: { type: "object" } },
        },
      },
    },
    securitySchemes: {} as Record<string, unknown>,
  };

  if (opts.requireAuth) {
    (components.securitySchemes as Record<string, unknown>).BearerAuth = {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    };
  }

  const schemas = components.schemas as Record<string, unknown>;
  for (const t of opts.tools) {
    const base = safeComponentName(t.name);
    schemas[`${base}_Input`] = t.inputSchema ?? { type: "object" };
    if (t.outputSchema) {
      schemas[`${base}_Output`] = t.outputSchema;
    }
  }

  const security = opts.requireAuth ? [{ BearerAuth: [] }] : [];

  const paths: Record<string, unknown> = {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean" }, transport: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/mcp/tools": {
      get: {
        summary: "List all tools with metadata",
        tags: ["MCP"],
        security,
        responses: {
          "200": {
            description: "List of tools",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tools: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ToolMeta" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/mcp/tools/{name}": {
      get: {
        summary: "Get tool metadata by name",
        tags: ["MCP"],
        security,
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tool name",
          },
        ],
        responses: {
          "200": {
            description: "Tool metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    tool: { $ref: "#/components/schemas/ToolMeta" },
                  },
                },
              },
            },
          },
          "404": { description: "Tool not found" },
        },
      },
    },
    "/mcp/call": {
      post: {
        summary: "Call a tool",
        tags: ["MCP"],
        security,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ToolCallRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Tool result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ToolCallResponse" },
              },
            },
          },
          "400": { description: "Bad request" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Tool not found" },
          "429": { description: "Rate limited" },
          "500": { description: "Tool error" },
        },
      },
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI specification",
        tags: ["System"],
        responses: {
          "200": { description: "OpenAPI 3.0 spec" },
        },
      },
    },
  };

  return {
    openapi: "3.0.0",
    info: {
      title: opts.title,
      version: opts.version,
      description: "MCP HTTP API for tool invocation",
    },
    servers: [{ url: "/" }],
    paths,
    components,
  };
}
