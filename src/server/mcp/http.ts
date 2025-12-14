import http from "node:http";
import { URL } from "node:url";
import { authenticate, AuthError, authorize, sendAuthError, type AuthContext } from "../auth/middleware.js";
import { UserStore } from "../auth/store.js";
import { ToolMetaForOpenApi, buildOpenApi } from "./openapi.js";

export interface McpHttpServerOpts {
  workspaceRoot: string;
  port?: number;
  jwtSecret?: string;
  requireAuth?: boolean;
  // 18.0: explicit tools map
  tools?: Map<string, (input: unknown, ctx?: AuthContext) => Promise<unknown>>;
  // 18.1: registry functions (auto-expose from McpServer)
  listTools?: () => unknown[];
  hasTool?: (name: string) => boolean;
  callTool?: (name: string, input: unknown, ctx?: AuthContext) => Promise<unknown>;
  // 18.2/18.3: tool metadata
  getToolMeta?: (name: string) => unknown | null;
  // 18.4: OpenAPI
  openApi?: { title: string; version: string };
  // 18.0: limits
  maxBodyBytes?: number;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface McpCallRequest {
  tool: string;
  input: unknown;
}

export interface McpCallResponse {
  ok: boolean;
  content?: unknown[];
  error?: string;
  message?: string;
}

function readBody(req: http.IncomingMessage, maxBytes?: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const limit = maxBytes ?? 1024 * 1024; // 1MB default
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        req.destroy();
        reject(Object.assign(new Error("BODY_TOO_LARGE"), { code: "BODY_TOO_LARGE" }));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

type RateLimitState = { resetAt: number; count: number };

export async function startMcpHttpServer(opts: McpHttpServerOpts): Promise<{ url: string; close: () => void }> {
  const userStore = new UserStore(opts.workspaceRoot);
  const port = opts.port ?? 3001;
  const maxBodyBytes = opts.maxBodyBytes ?? 1024 * 1024;
  const rl = opts.rateLimit ?? { windowMs: 10_000, maxRequests: 60 };
  const rateMap = new Map<string, RateLimitState>();

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (u.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, transport: "http" }));
      return;
    }

    // 18.4: OpenAPI spec
    if (u.pathname === "/openapi.json" && req.method === "GET") {
      const toolsList = (opts.listTools?.() ?? []) as ToolMetaForOpenApi[];
      const spec = buildOpenApi({
        title: opts.openApi?.title ?? "MCP HTTP",
        version: opts.openApi?.version ?? "0.0.0",
        tools: toolsList,
        requireAuth: opts.requireAuth ?? false,
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(spec, null, 2));
      return;
    }

    // Rate limiting
    const ip = (req.socket.remoteAddress ?? "unknown").replace(/:/g, "");
    const now = Date.now();
    const st = rateMap.get(ip) ?? { resetAt: now + rl.windowMs, count: 0 };
    if (now > st.resetAt) {
      st.resetAt = now + rl.windowMs;
      st.count = 0;
    }
    st.count += 1;
    rateMap.set(ip, st);
    if (st.count > rl.maxRequests) {
      res.writeHead(429, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "RATE_LIMIT", resetAt: st.resetAt }));
      return;
    }

    // MCP call endpoint
    if (u.pathname === "/mcp/call" && req.method === "POST") {
      let authCtx: AuthContext | undefined;

      // Auth if required
      if (opts.requireAuth !== false) {
        try {
          authCtx = await authenticate(req, userStore, opts.jwtSecret);
        } catch (e) {
          if (e instanceof AuthError) {
            sendAuthError(res, e);
            return;
          }
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "AUTH_ERROR", message: String(e) }));
          return;
        }
      }

      try {
        const body = await readBody(req, maxBodyBytes);
        const { tool, input } = JSON.parse(body) as McpCallRequest;

        if (!tool || typeof tool !== "string") {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "INVALID_REQUEST", message: "Missing tool name" }));
          return;
        }

        // Authorization check
        if (authCtx) {
          try {
            authorize(authCtx.user, tool);
          } catch (e) {
            if (e instanceof AuthError) {
              sendAuthError(res, e);
              return;
            }
            throw e;
          }
        }

        // 18.1: support registry functions
        const toolExists = opts.hasTool?.(tool) ?? opts.tools?.has(tool) ?? false;
        if (!toolExists) {
          res.writeHead(404, { "content-type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "TOOL_NOT_FOUND", message: `Unknown tool: ${tool}` }));
          return;
        }

        const result = opts.callTool
          ? await opts.callTool(tool, input, authCtx)
          : await opts.tools!.get(tool)!(input, authCtx);
        const response: McpCallResponse = {
          ok: true,
          content: [{ type: "text", text: JSON.stringify(result) }],
        };

        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (e: unknown) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            error: "TOOL_ERROR",
            message: e instanceof Error ? e.message : String(e),
          })
        );
      }
      return;
    }

    // List tools (18.1/18.2: support registry functions with metadata)
    if (u.pathname === "/mcp/tools" && req.method === "GET") {
      const toolsList = opts.listTools?.() ?? (opts.tools ? [...opts.tools.keys()].map((n) => ({ name: n })) : []);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, tools: toolsList }));
      return;
    }

    // 18.2/18.3: Tool detail endpoint
    const toolDetailMatch = u.pathname.match(/^\/mcp\/tools\/([^/]+)$/);
    if (toolDetailMatch && req.method === "GET") {
      const toolName = decodeURIComponent(toolDetailMatch[1]!);
      const meta = opts.getToolMeta?.(toolName);
      if (!meta) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "TOOL_NOT_FOUND", message: `Unknown tool: ${toolName}` }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, tool: meta }));
      return;
    }

    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      const addr = server.address();
      const actualPort = typeof addr === "object" && addr ? addr.port : port;
      resolve({
        url: `http://localhost:${actualPort}`,
        close: () => server.close(),
      });
    });
  });
}
