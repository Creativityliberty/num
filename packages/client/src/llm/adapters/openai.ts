import type { LLMAdapter, LLMMessage, ExpectedSchemaName } from "../adapter.js";

export type OpenAIAdapterOptions = {
  apiKey: string;
  model: string;
  baseUrl?: string;
};

function toOpenAIInput(messages: LLMMessage[]) {
  return messages.map((m) => ({ role: m.role === "developer" ? "developer" : m.role, content: m.content }));
}

export class OpenAIAdapter implements LLMAdapter {
  id = "openai";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(opts: OpenAIAdapterOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";
  }

  async completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number }): Promise<string> {
    const payload = {
      model: this.model,
      input: toOpenAIInput(opts.messages),
    };

    const res = await fetch(`${this.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI response error ${res.status}: ${text.slice(0, 500)}`);
    }

    const json = (await res.json()) as Record<string, unknown>;
    const out =
      json.output_text ??
      (json.output as Array<{ content?: Array<{ text?: string }> }> | undefined)?.map((x) => x?.content?.map((c) => c?.text).join("")).join("\n") ??
      JSON.stringify(json);
    return String(out);
  }
}
