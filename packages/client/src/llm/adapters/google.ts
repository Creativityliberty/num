import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../adapter.js";

type ModelRef = { provider: string; model: string };

export class GoogleGeminiAdapter implements LLMAdapter {
  id: string;
  private apiKey: string;
  private model: ModelRef;
  private lastUsage: { inputTokens?: number; outputTokens?: number } | null = null;

  constructor(opts: { apiKey?: string; model: string }) {
    const apiKey = opts.apiKey ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY)");
    this.apiKey = apiKey;
    this.model = { provider: "google", model: opts.model };
    this.id = `google:${opts.model}`;
  }

  setModel(m: any) {
    this.model = { provider: String(m?.provider ?? "google"), model: String(m?.model ?? this.model.model) };
    this.id = `google:${this.model.model}`;
  }

  getLastUsage() {
    return this.lastUsage;
  }

  async completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number }): Promise<string> {
    const maxRetries = opts.maxRetries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.invoke({ messages: opts.messages });
        // Try to extract JSON from response
        const jsonMatch = result.text.match(/```json\s*([\s\S]*?)\s*```/) ||
                          result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          JSON.parse(jsonStr); // Validate it's valid JSON
          return jsonStr;
        }
        // If no JSON block, try parsing the whole response
        JSON.parse(result.text);
        return result.text;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }
    throw lastError ?? new Error("Failed to get valid JSON from Gemini");
  }

  async invoke(opts: { messages: LLMMessage[]; maxTokens?: number }): Promise<{ text: string }> {
    // Build prompt from messages
    const text = opts.messages
      .map((m) => {
        const role = m.role === "system" ? "SYSTEM" : m.role === "developer" ? "DEVELOPER" : "USER";
        return `${role}:\n${String(m.content ?? "")}`;
      })
      .join("\n\n");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: {
        ...(opts.maxTokens ? { maxOutputTokens: opts.maxTokens } : {}),
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const resp: any = await res.json();

    const outText =
      resp?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
      "";

    // Usage tracking
    const usage = resp?.usageMetadata
      ? {
          inputTokens: resp.usageMetadata.promptTokenCount,
          outputTokens: resp.usageMetadata.candidatesTokenCount,
        }
      : null;
    this.lastUsage = usage;

    return { text: outText };
  }
}
