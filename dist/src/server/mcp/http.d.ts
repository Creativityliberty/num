import { type AuthContext } from "../auth/middleware.js";
export interface McpHttpServerOpts {
    workspaceRoot: string;
    port?: number;
    jwtSecret?: string;
    requireAuth?: boolean;
    tools?: Map<string, (input: unknown, ctx?: AuthContext) => Promise<unknown>>;
    listTools?: () => unknown[];
    hasTool?: (name: string) => boolean;
    callTool?: (name: string, input: unknown, ctx?: AuthContext) => Promise<unknown>;
    getToolMeta?: (name: string) => unknown | null;
    openApi?: {
        title: string;
        version: string;
    };
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
export declare function startMcpHttpServer(opts: McpHttpServerOpts): Promise<{
    url: string;
    close: () => void;
}>;
