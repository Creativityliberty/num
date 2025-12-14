import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ToolTextResponse } from "./types.js";

// Re-export HTTP transport
export { McpHttpClient } from "./httpClient.js";
export type { McpHttpClientOpts } from "./httpClient.js";

export type McpSpawnOptions = {
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
};

export class McpToolClient {
  private client: Client;
  private transport: StdioClientTransport;

  private constructor(client: Client, transport: StdioClientTransport) {
    this.client = client;
    this.transport = transport;
  }

  static async connectStdio(opts: McpSpawnOptions): Promise<McpToolClient> {
    const transportOpts: { command: string; args: string[]; env?: Record<string, string>; cwd?: string } = {
      command: opts.command,
      args: opts.args,
    };
    if (opts.env !== undefined) transportOpts.env = opts.env;
    if (opts.cwd !== undefined) transportOpts.cwd = opts.cwd;
    const transport = new StdioClientTransport(transportOpts);

    const client = new Client(
      { name: "@mcp-agents-modes/client", version: "0.1.0" },
      { capabilities: {} }
    );

    await client.connect(transport);
    return new McpToolClient(client, transport);
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
    } finally {
      try {
        await this.transport.close();
      } catch {
        // ignore
      }
    }
  }

  async callToolJSON<T>(tool: string, input: unknown): Promise<T> {
    const res = (await this.client.callTool({
      name: tool,
      arguments: input as Record<string, unknown>,
    })) as ToolTextResponse;

    const text = res?.content?.[0]?.text;
    if (!text) throw new Error(`Empty tool response for ${tool}`);

    try {
      return JSON.parse(text) as T;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Tool ${tool} returned non-JSON text: ${msg}\n${text.slice(0, 500)}`);
    }
  }
}
