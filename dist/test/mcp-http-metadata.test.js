import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { startMcpHttpServer } from "../src/server/mcp/http.js";
import { McpServer } from "../src/server/mcp/server.js";
describe("18.2/18.3 tool metadata", () => {
    let tmpDir;
    let server;
    let mcpServer;
    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-meta-test-"));
        await fs.mkdir(path.join(tmpDir, ".mcp"), { recursive: true });
        mcpServer = new McpServer();
        mcpServer.tool("demo.echo", "Echo the input message", z.object({ message: z.string() }), async (input) => input);
        mcpServer.tool("demo.sum", "Sum two numbers", z.object({ a: z.number(), b: z.number() }), async (input) => ({ sum: input.a + input.b }), {
            outputSchema: z.object({ sum: z.number() }),
            examples: [
                { title: "2+3", input: { a: 2, b: 3 }, output: { sum: 5 } },
            ],
        });
        server = await startMcpHttpServer({
            workspaceRoot: tmpDir,
            port: 0,
            requireAuth: false,
            listTools: () => mcpServer.listTools(),
            getToolMeta: (name) => mcpServer.getToolMeta(name),
            hasTool: (name) => mcpServer.hasTool(name),
            callTool: (name, input) => mcpServer.callToolJSON(name, input),
            openApi: { title: "Test API", version: "1.0.0" },
        });
    });
    afterAll(async () => {
        server?.close();
        await fs.rm(tmpDir, { recursive: true, force: true });
    });
    it("lists tools with inputSchema", async () => {
        const r = await fetch(`${server.url}/mcp/tools`);
        expect(r.status).toBe(200);
        const j = (await r.json());
        expect(j.ok).toBe(true);
        expect(j.tools.length).toBe(2);
        const echo = j.tools.find((t) => t.name === "demo.echo");
        expect(echo?.inputSchema).toBeTruthy();
    });
    it("returns tool detail with inputSchema and description", async () => {
        const r = await fetch(`${server.url}/mcp/tools/demo.echo`);
        expect(r.status).toBe(200);
        const j = (await r.json());
        expect(j.ok).toBe(true);
        expect(j.tool.description).toBe("Echo the input message");
        expect(j.tool.inputSchema.properties.message.type).toBe("string");
    });
    it("returns outputSchema and examples for tools that have them", async () => {
        const r = await fetch(`${server.url}/mcp/tools/demo.sum`);
        expect(r.status).toBe(200);
        const j = (await r.json());
        expect(j.ok).toBe(true);
        expect(j.tool.outputSchema.properties.sum.type).toBe("number");
        expect(j.tool.examples.length).toBe(1);
        expect(j.tool.examples[0]?.title).toBe("2+3");
    });
    it("returns 404 for unknown tool", async () => {
        const r = await fetch(`${server.url}/mcp/tools/unknown.tool`);
        expect(r.status).toBe(404);
    });
});
describe("18.4 OpenAPI", () => {
    let tmpDir;
    let server;
    let mcpServer;
    beforeAll(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-openapi-test-"));
        await fs.mkdir(path.join(tmpDir, ".mcp"), { recursive: true });
        mcpServer = new McpServer();
        mcpServer.tool("demo.ping", "Ping", z.object({}), async () => ({ pong: true }));
        server = await startMcpHttpServer({
            workspaceRoot: tmpDir,
            port: 0,
            requireAuth: false,
            listTools: () => mcpServer.listTools(),
            getToolMeta: (name) => mcpServer.getToolMeta(name),
            hasTool: (name) => mcpServer.hasTool(name),
            callTool: (name, input) => mcpServer.callToolJSON(name, input),
            openApi: { title: "Test OpenAPI", version: "1.0.0" },
        });
    });
    afterAll(async () => {
        server?.close();
        await fs.rm(tmpDir, { recursive: true, force: true });
    });
    it("serves OpenAPI spec", async () => {
        const r = await fetch(`${server.url}/openapi.json`);
        expect(r.status).toBe(200);
        const j = (await r.json());
        expect(j.openapi).toBe("3.0.0");
        expect(j.info.title).toBe("Test OpenAPI");
        expect(j.paths["/mcp/call"]).toBeTruthy();
        expect(j.paths["/mcp/tools"]).toBeTruthy();
        expect(j.paths["/mcp/tools/{name}"]).toBeTruthy();
    });
});
//# sourceMappingURL=mcp-http-metadata.test.js.map