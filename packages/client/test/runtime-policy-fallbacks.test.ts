import { describe, expect, it } from "vitest";
import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../src/llm/adapter.js";
import { BudgetGuard, ModelRouter, RateLimiter } from "../src/orchestrator/runtimePolicy.js";

class FakeAdapter implements LLMAdapter {
  id: string;
  completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number; }): Promise<string> {
      throw new Error("Method not implemented.");
  }
  public model: { provider: string; model: string } | null = null;
  private usage = { inputTokens: 10, outputTokens: 5, costUsd: 0.01 };

  setModel(m: { provider: string; model: string }) {
    this.model = m;
  }

  getLastUsage() {
    return this.usage;
  }

  async invoke() {
    return { text: `ok:${this.model?.provider}:${this.model?.model}` };
  }
}

class FlakyAdapter implements LLMAdapter {
  id: string;
  completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number; }): Promise<string> {
      throw new Error("Method not implemented.");
  }
  public model: { provider: string; model: string } | null = null;

  setModel(m: { provider: string; model: string }) {
    this.model = m;
  }

  async invoke() {
    if (this.model?.model === "bad-model") {
      const e: Error & { code?: string } = new Error("429 Rate limit");
      e.code = "RATE_LIMIT";
      throw e;
    }
    return { text: `ok:${this.model?.model}` };
  }
}

class HardFailAdapter implements LLMAdapter {
  id: string;
  completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number; }): Promise<string> {
      throw new Error("Method not implemented.");
  }
  public model: { provider: string; model: string } | null = null;

  setModel(m: { provider: string; model: string }) {
    this.model = m;
  }

  async invoke() {
    throw new Error("BAD_REQUEST invalid input");
  }
}

describe("19.1 runtimePolicy router/guards", () => {
  it("reuses adapter and sets preferred model", () => {
    const router = new ModelRouter(() => new FakeAdapter());
    const base = new FakeAdapter();
    const { adapter, chosen } = router.pickAdapter({
      baseAdapter: base,
      runtimePolicy: { model: { preferred: { provider: "anthropic", model: "claude-x" } } },
      fallbackModel: { provider: "openai", model: "gpt-mini" },
    });
    expect(adapter).toBe(base);
    expect(chosen?.provider).toBe("anthropic");
    expect(chosen?.model).toBe("claude-x");
  });

  it("uses fallback model when no preferred specified", () => {
    const router = new ModelRouter(() => new FakeAdapter());
    const { chosen } = router.pickAdapter({
      runtimePolicy: {},
      fallbackModel: { provider: "openai", model: "gpt-fallback" },
    });
    expect(chosen?.model).toBe("gpt-fallback");
  });

  it("budget blocks when maxTokens exceeded", () => {
    const b = new BudgetGuard({ maxTokens: 10 });
    b.afterCall({ inputTokens: 8, outputTokens: 5, costUsd: 0 });
    expect(() => b.beforeCall()).toThrow(/BUDGET_BLOCK/);
  });

  it("budget blocks when maxCostUsd exceeded", () => {
    const b = new BudgetGuard({ maxCostUsd: 0.01 });
    expect(() => b.afterCall({ inputTokens: 10, outputTokens: 5, costUsd: 0.02 })).toThrow(/BUDGET_BLOCK/);
  });

  it("rate limiter acquires without throwing", async () => {
    const rl = new RateLimiter({ rpm: 100 });
    await rl.acquire(0);
    rl.commit(1);
    expect(true).toBe(true);
  });
});

describe("19.2 invokeWithFallbacks", () => {
  it("falls back on transient errors", async () => {
    const router = new ModelRouter(() => new FlakyAdapter());
    const base = new FlakyAdapter();

    const out = await router.invokeWithFallbacks({
      baseAdapter: base,
      runtimePolicy: {
        model: {
          preferred: { provider: "openai", model: "bad-model" },
          fallbacks: [{ provider: "openai", model: "good-model" }],
        },
      },
      messages: [{ role: "user", content: "hi" }],
      onLog: () => {},
    });

    expect(out.text).toContain("good-model");
    expect(out.tried.length).toBe(2);
    expect(out.tried[0].ok).toBe(false);
    expect(out.tried[1].ok).toBe(true);
    expect(out.chosen?.model).toBe("good-model");
  });

  it("does not fallback on non-transient errors", async () => {
    const router = new ModelRouter(() => new HardFailAdapter());
    const base = new HardFailAdapter();

    await expect(
      router.invokeWithFallbacks({
        baseAdapter: base,
        runtimePolicy: {
          model: {
            preferred: { provider: "openai", model: "x" },
            fallbacks: [{ provider: "openai", model: "y" }],
          },
        },
        messages: [{ role: "user", content: "hi" }],
        onLog: () => {},
      })
    ).rejects.toThrow(/BAD_REQUEST/);
  });

  it("throws ALL_MODELS_FAILED when all models fail with transient errors", async () => {
    class AllFailAdapter implements LLMAdapter {
      id: string;
      completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName; maxRetries?: number; }): Promise<string> {
          throw new Error("Method not implemented.");
      }
      public model: { provider: string; model: string } | null = null;
      setModel(m: { provider: string; model: string }) {
        this.model = m;
      }
      async invoke() {
        throw new Error("429 Rate limit");
      }
    }

    const router = new ModelRouter(() => new AllFailAdapter());

    await expect(
      router.invokeWithFallbacks({
        runtimePolicy: {
          model: {
            preferred: { provider: "openai", model: "a" },
            fallbacks: [{ provider: "openai", model: "b" }],
          },
        },
        messages: [{ role: "user", content: "hi" }],
        onLog: () => {},
      })
    ).rejects.toThrow(/ALL_MODELS_FAILED/);
  });

  it("logs model attempts", async () => {
    const router = new ModelRouter(() => new FlakyAdapter());
    const base = new FlakyAdapter();
    const logs: unknown[] = [];

    await router.invokeWithFallbacks({
      baseAdapter: base,
      runtimePolicy: {
        model: {
          preferred: { provider: "openai", model: "bad-model" },
          fallbacks: [{ provider: "openai", model: "good-model" }],
        },
      },
      messages: [{ role: "user", content: "hi" }],
      onLog: (evt) => logs.push(evt),
    });

    expect(logs.length).toBeGreaterThan(0);
    const kinds = logs.map((l) => (l as { kind: string }).kind);
    expect(kinds).toContain("model_try");
    expect(kinds).toContain("model_fail");
    expect(kinds).toContain("model_chosen");
  });
});
