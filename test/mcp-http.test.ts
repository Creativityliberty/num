import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startMcpHttpServer } from "../src/server/mcp/http.js";

describe("18.0 MCP HTTP server", () => {
  let tmpDir: string;
  let server: { url: string; close: () => void };

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-http-test-"));
    await fs.mkdir(path.join(tmpDir, ".mcp"), { recursive: true });

    const tools = new Map<string, (input: unknown) => Promise<unknown>>();
    tools.set("modes.list", async () => ({ modes: ["a", "b"] }));
    tools.set("exec.run", async () => ({ ran: true }));

    server = await startMcpHttpServer({
      workspaceRoot: tmpDir,
      port: 0,
      requireAuth: false,
      tools,
    });
  });

  afterAll(async () => {
    server?.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("health check returns ok", async () => {
    const r = await fetch(`${server.url}/health`);
    expect(r.status).toBe(200);
    const j = (await r.json()) as { ok: boolean };
    expect(j.ok).toBe(true);
  });

  it("lists tools", async () => {
    const r = await fetch(`${server.url}/mcp/tools`);
    expect(r.status).toBe(200);
    const j = (await r.json()) as { ok: boolean; tools: Array<{ name: string }> };
    expect(j.ok).toBe(true);
    const names = j.tools.map((t) => t.name);
    expect(names).toContain("modes.list");
    expect(names).toContain("exec.run");
  });

  it("calls tool successfully", async () => {
    const r = await fetch(`${server.url}/mcp/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool: "modes.list", input: {} }),
    });
    expect(r.status).toBe(200);
    const j = (await r.json()) as { ok: boolean; content: unknown[] };
    expect(j.ok).toBe(true);
  });

  it("returns 404 for unknown tool", async () => {
    const r = await fetch(`${server.url}/mcp/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool: "unknown.tool", input: {} }),
    });
    expect(r.status).toBe(404);
  });

  it("returns 400 for missing tool name", async () => {
    const r = await fetch(`${server.url}/mcp/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: {} }),
    });
    expect(r.status).toBe(400);
  });
});

describe("18.0 MCP HTTP rate limiting", () => {
  let tmpDir: string;
  let server: { url: string; close: () => void };

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-http-rl-"));
    await fs.mkdir(path.join(tmpDir, ".mcp"), { recursive: true });

    const tools = new Map<string, (input: unknown) => Promise<unknown>>();
    tools.set("test.ping", async () => ({ pong: true }));

    server = await startMcpHttpServer({
      workspaceRoot: tmpDir,
      port: 0,
      requireAuth: false,
      tools,
      rateLimit: { windowMs: 60000, maxRequests: 3 },
    });
  });

  afterAll(async () => {
    server?.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("enforces rate limit", async () => {
    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const r = await fetch(`${server.url}/mcp/tools`);
      expect(r.status).toBe(200);
    }

    // 4th request should be rate limited
    const r = await fetch(`${server.url}/mcp/tools`);
    expect(r.status).toBe(429);
    const j = (await r.json()) as { error: string };
    expect(j.error).toBe("RATE_LIMIT");
  });
});
