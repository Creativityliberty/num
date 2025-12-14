import type { LLMAdapter } from "../llm/adapter.js";
import { AnthropicAdapter } from "../llm/adapters/anthropic.js";
import { GoogleGeminiAdapter } from "../llm/adapters/google.js";
import { OpenAIAdapter } from "../llm/adapters/openai.js";
import { withRetries } from "../util/retry.js";

export type ModelRef = { provider: "openai" | "anthropic" | "google" | string; model: string };

export type RuntimePolicy = {
  model?: {
    preferred?: ModelRef;
    fallbacks?: ModelRef[];
  };
  budget?: {
    maxTokens?: number;
    maxCostUsd?: number;
  };
  rateLimit?: {
    rpm?: number;
    tpm?: number;
  };
};

export type AdapterFactory = (model: ModelRef) => LLMAdapter;

export function defaultAdapterFactory(): AdapterFactory {
  return (m: ModelRef) => {
    const p = (m.provider ?? "").toLowerCase();
    if (p === "anthropic") {
      const k = process.env.ANTHROPIC_API_KEY ?? "";
      return new AnthropicAdapter({ apiKey: k, model: m.model });
    }
    if (p === "google" || p === "gemini") {
      return new GoogleGeminiAdapter({ model: m.model, apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY });
    }
    const k = process.env.OPENAI_API_KEY ?? "";
    return new OpenAIAdapter({ apiKey: k, model: m.model });
  };
}

export type ModelTryResult = {
  model: ModelRef;
  ok: boolean;
  reason?: string;
};

export class ModelRouter {
  constructor(private factory: AdapterFactory = defaultAdapterFactory()) {}

  pickAdapter(opts: {
    baseAdapter?: LLMAdapter;
    runtimePolicy?: RuntimePolicy | null;
    roleHint?: string;
    fallbackModel?: ModelRef;
  }): { adapter: LLMAdapter; chosen?: ModelRef; tried: ModelRef[] } {
    const rp = opts.runtimePolicy ?? undefined;
    const preferred = rp?.model?.preferred;
    const fallbacks = rp?.model?.fallbacks ?? [];
    const fallbackModel = opts.fallbackModel ?? { provider: "openai", model: "gpt-4.1-mini" };
    const chain: ModelRef[] = [
      ...(preferred ? [preferred] : []),
      ...fallbacks,
      ...(preferred || fallbacks.length ? [] : [fallbackModel]),
    ];

    if (opts.baseAdapter && chain.length && typeof opts.baseAdapter.setModel === "function") {
      opts.baseAdapter.setModel(chain[0]);
      return { adapter: opts.baseAdapter, chosen: chain[0], tried: chain };
    }

    return { adapter: this.factory(chain[0]), chosen: chain[0], tried: chain };
  }

  async invokeWithFallbacks(opts: {
    baseAdapter?: LLMAdapter;
    runtimePolicy?: RuntimePolicy | null;
    fallbackModel?: ModelRef;
    maxTokens?: number;
    messages: Array<{ role: string; content: string }>;
    isTransientError?: (e: unknown) => boolean;
    onLog?: (evt: unknown) => void;
  }): Promise<{
    text: string;
    chosen?: ModelRef;
    tried: ModelTryResult[];
    usage?: { inputTokens?: number; outputTokens?: number; costUsd?: number } | null;
  }> {
    const log = opts.onLog ?? (() => {});
    const pick = this.pickAdapter({
      baseAdapter: opts.baseAdapter,
      runtimePolicy: opts.runtimePolicy,
      fallbackModel: opts.fallbackModel,
    });

    const chain = pick.tried;
    const tried: ModelTryResult[] = [];

    const isTransient =
      opts.isTransientError ??
      ((e: unknown) => {
        const msg = String((e as Error)?.message ?? e);
        const code = String((e as { code?: string })?.code ?? "");
        return (
          msg.includes("429") ||
          msg.includes("Rate limit") ||
          msg.includes("timeout") ||
          msg.includes("ETIMEDOUT") ||
          msg.includes("ECONNRESET") ||
          msg.includes("ENOTFOUND") ||
          msg.includes("503") ||
          msg.includes("502") ||
          msg.includes("500") ||
          code === "RATE_LIMIT" ||
          code === "ETIMEDOUT" ||
          code === "ECONNRESET"
        );
      });

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];
      const adapter =
        opts.baseAdapter && typeof opts.baseAdapter.setModel === "function"
          ? (opts.baseAdapter.setModel(model), opts.baseAdapter)
          : this.factory(model);

      log({ kind: "model_try", model, idx: i });

      try {
        const raw = await withRetries(
          async () => {
            const resp = await adapter.invoke({ messages: opts.messages, maxTokens: opts.maxTokens });
            return resp.text;
          },
          {
            retries: 1,
            onRetry: (e: unknown) => log({ kind: "model_retry", model, error: String(e) }),
            retryIf: (e: unknown) => isTransient(e),
          }
        );

        const usage = typeof adapter.getLastUsage === "function" ? adapter.getLastUsage() : null;
        tried.push({ model, ok: true });
        log({ kind: "model_chosen", model });
        return { text: raw, chosen: model, tried, usage };
      } catch (e: unknown) {
        const reason = String((e as Error)?.message ?? e);
        tried.push({ model, ok: false, reason });
        log({ kind: "model_fail", model, error: reason, transient: isTransient(e) });

        if (!isTransient(e)) throw e;
      }
    }

    const err: Error & { code?: string; tried?: ModelTryResult[] } = new Error("ALL_MODELS_FAILED");
    err.code = "ALL_MODELS_FAILED";
    err.tried = tried;
    throw err;
  }
}

export class BudgetGuard {
  private usedTokens = 0;
  private usedCostUsd = 0;

  constructor(private budget?: RuntimePolicy["budget"]) {}

  beforeCall(_maxTokensHint?: number) {
    const maxTokens = this.budget?.maxTokens;
    if (maxTokens !== undefined && this.usedTokens >= maxTokens) {
      const e: Error & { code?: string } = new Error(
        `BUDGET_BLOCK: maxTokens exceeded (${this.usedTokens}/${maxTokens})`
      );
      e.code = "BUDGET_BLOCK";
      throw e;
    }
  }

  afterCall(usage: { inputTokens?: number; outputTokens?: number; costUsd?: number } | null | undefined) {
    if (!usage) return;
    const inT = usage.inputTokens ?? 0;
    const outT = usage.outputTokens ?? 0;
    this.usedTokens += inT + outT;
    if (typeof usage.costUsd === "number") this.usedCostUsd += usage.costUsd;

    const maxCost = this.budget?.maxCostUsd;
    if (maxCost !== undefined && this.usedCostUsd > maxCost) {
      const e: Error & { code?: string } = new Error(
        `BUDGET_BLOCK: maxCostUsd exceeded (${this.usedCostUsd.toFixed(4)}/${maxCost})`
      );
      e.code = "BUDGET_BLOCK";
      throw e;
    }
  }

  snapshot() {
    return { usedTokens: this.usedTokens, usedCostUsd: this.usedCostUsd };
  }
}

class SlidingWindowCounter {
  private events: Array<{ ts: number; tokens: number }> = [];
  constructor(private windowMs: number) {}

  add(tokens: number) {
    const now = Date.now();
    this.events.push({ ts: now, tokens });
    this.gc(now);
  }

  count(): number {
    const now = Date.now();
    this.gc(now);
    return this.events.length;
  }

  tokens(): number {
    const now = Date.now();
    this.gc(now);
    return this.events.reduce((s, e) => s + e.tokens, 0);
  }

  private gc(now: number) {
    const cut = now - this.windowMs;
    while (this.events.length && this.events[0].ts < cut) this.events.shift();
  }
}

export class RateLimiter {
  private win = new SlidingWindowCounter(60_000);
  constructor(private rate?: RuntimePolicy["rateLimit"]) {}

  async acquire(tokensPlanned: number) {
    const rpm = this.rate?.rpm;
    const tpm = this.rate?.tpm;
    while (true) {
      const reqs = this.win.count();
      const toks = this.win.tokens();
      const okR = rpm === undefined || reqs < rpm;
      const okT = tpm === undefined || toks + tokensPlanned <= tpm;
      if (okR && okT) return;
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  commit(tokensActual: number) {
    this.win.add(tokensActual);
  }
}
