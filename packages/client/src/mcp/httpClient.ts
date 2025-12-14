export interface McpHttpClientOpts {
  baseUrl: string;
  token?: string;
}

export class McpHttpClient {
  constructor(private opts: McpHttpClientOpts) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "content-type": "application/json" };
    if (this.opts.token) {
      h["authorization"] = `Bearer ${this.opts.token}`;
    }
    return h;
  }

  async listTools(): Promise<string[]> {
    const r = await fetch(`${this.opts.baseUrl}/mcp/tools`, {
      method: "GET",
      headers: this.headers(),
    });
    const j = (await r.json()) as { tools?: string[]; error?: string };
    if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
    return j.tools ?? [];
  }

  async callToolJSON<T = unknown>(tool: string, input: unknown): Promise<T> {
    const r = await fetch(`${this.opts.baseUrl}/mcp/call`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ tool, input }),
    });
    const j = (await r.json()) as { ok: boolean; content?: unknown[]; error?: string; message?: string };
    if (!j.ok) {
      throw new Error(`${j.error ?? "CALL_FAILED"}: ${j.message ?? ""}`);
    }
    // Extract result from content
    if (j.content && j.content.length > 0) {
      const first = j.content[0] as { type?: string; text?: string };
      if (first.type === "text" && first.text) {
        try {
          return JSON.parse(first.text) as T;
        } catch {
          return first.text as unknown as T;
        }
      }
    }
    return j.content as unknown as T;
  }

  async health(): Promise<boolean> {
    try {
      const r = await fetch(`${this.opts.baseUrl}/health`, { method: "GET" });
      const j = (await r.json()) as { ok?: boolean };
      return j.ok === true;
    } catch {
      return false;
    }
  }
}
