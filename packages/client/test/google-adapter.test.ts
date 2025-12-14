import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleGeminiAdapter } from "../src/llm/adapters/google.js";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("GoogleGeminiAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
  });

  it("invokes and returns text", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "hello world" }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      }),
    });

    const adapter = new GoogleGeminiAdapter({ model: "gemini-1.5-pro" });
    const result = await adapter.invoke({ messages: [{ role: "user", content: "hi" }] });

    expect(result.text).toBe("hello world");
    expect(adapter.getLastUsage()?.inputTokens).toBe(10);
    expect(adapter.getLastUsage()?.outputTokens).toBe(5);
  });

  it("completeJSON extracts JSON from response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '```json\n{"plan": "test"}\n```' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      }),
    });

    const adapter = new GoogleGeminiAdapter({ model: "gemini-1.5-pro" });
    const result = await adapter.completeJSON({
      messages: [{ role: "user", content: "generate plan" }],
      expected: "PlanJSON",
    });

    expect(JSON.parse(result)).toEqual({ plan: "test" });
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const adapter = new GoogleGeminiAdapter({ model: "gemini-1.5-pro" });
    await expect(adapter.invoke({ messages: [{ role: "user", content: "hi" }] })).rejects.toThrow(
      "Gemini API error"
    );
  });

  it("throws if no API key", () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    expect(() => new GoogleGeminiAdapter({ model: "gemini-1.5-pro" })).toThrow("Missing GEMINI_API_KEY");
  });
});
