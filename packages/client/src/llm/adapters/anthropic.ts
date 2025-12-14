import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../adapter.js";

export type AnthropicAdapterOptions = {
  apiKey: string;
  model: string;
  baseUrl?: string;
};

function splitForClaude(messages: LLMMessage[]) {
  const systemParts: string[] = [];
  const chat: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of messages) {
    if (m.role === "system") systemParts.push(m.content);
    else if (m.role === "developer") systemParts.push(m.content);
    else if (m.role === "user") chat.push({ role: "user", content: m.content });
  }
  return { system: systemParts.join("\n\n"), messages: chat };
}

export class AnthropicAdapter implements LLMAdapter {
  id = "anthropic";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts: AnthropicAdapterOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.baseUrl = opts.baseUrl ?? "https://api.anthropic.com/v1";
  }

  async completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number }): Promise<string> {
    const { system, messages } = splitForClaude(opts.messages);
    const payload = {
      model: this.model,
      max_tokens: 4096,
      system,
      messages,
    };

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic response error ${res.status}: ${text.slice(0, 500)}`);
    }

    const json = (await res.json()) as { content?: Array<{ text?: string }> };
    const out = json.content?.map((c) => c?.text).join("") ?? JSON.stringify(json);
    return String(out);
  }
}
