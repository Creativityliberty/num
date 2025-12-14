import fs from "node:fs";
import path from "node:path";

export type ModelRef = { provider: string; model: string };

export type TelemetryEvent = {
  ts: string;
  type: string;
  provider?: string;
  model?: string;
  status?: number;
  latencyMs?: number;
  error?: string;
};

export type ModelHealthRow = {
  provider: string;
  model: string;
  calls: number;
  rate429: number;
  err5xx: number;
  timeouts: number;
  avgMs: number;
  p95Ms: number;
  healthScore: number;
  lastSeen: string;
};

export type ModelHealthReport = {
  range: string;
  generatedAt: string;
  totals: { calls: number; rate429: number; err5xx: number; timeouts: number };
  rows: ModelHealthRow[];
};

export type FallbackSuggestion = {
  from: ModelRef;
  to: ModelRef;
  confidence: "high" | "medium" | "low";
  reason: string;
  metrics: { fromScore: number; toScore: number; delta: number };
};

function parseRange(range: string): number {
  if (range === "24h") return 24 * 60 * 60 * 1000;
  if (range === "7d") return 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return 30 * 24 * 60 * 60 * 1000;
  return Infinity; // "all"
}

export function loadTelemetryEvents(root: string): TelemetryEvent[] {
  const telemetryDir = path.join(root, ".mcp", "telemetry");
  if (!fs.existsSync(telemetryDir)) return [];

  const events: TelemetryEvent[] = [];
  const files = fs.readdirSync(telemetryDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(telemetryDir, file), "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        events.push(...data);
      } else if (data.events && Array.isArray(data.events)) {
        events.push(...data.events);
      } else if (data.ts) {
        events.push(data);
      }
    } catch {
      // Skip corrupt files
    }
  }

  return events;
}

function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

export function computeModelHealthFromEvents(events: TelemetryEvent[], range: string): ModelHealthReport {
  const rangeMs = parseRange(range);
  const now = Date.now();
  const cutoff = now - rangeMs;

  const filtered = events.filter((e) => {
    if (!e.ts) return false;
    const ts = new Date(e.ts).getTime();
    return ts >= cutoff;
  });

  const byModel = new Map<string, {
    provider: string;
    model: string;
    calls: number;
    rate429: number;
    err5xx: number;
    timeouts: number;
    latencies: number[];
    lastSeen: string;
  }>();

  for (const e of filtered) {
    if (!e.provider || !e.model) continue;
    const key = `${e.provider}:${e.model}`;
    let row = byModel.get(key);
    if (!row) {
      row = {
        provider: e.provider,
        model: e.model,
        calls: 0,
        rate429: 0,
        err5xx: 0,
        timeouts: 0,
        latencies: [],
        lastSeen: e.ts,
      };
      byModel.set(key, row);
    }

    row.calls++;
    if (e.ts > row.lastSeen) row.lastSeen = e.ts;

    if (e.status === 429) row.rate429++;
    if (e.status && e.status >= 500 && e.status < 600) row.err5xx++;
    if (e.error?.toLowerCase().includes("timeout")) row.timeouts++;
    if (typeof e.latencyMs === "number") row.latencies.push(e.latencyMs);
  }

  const rows: ModelHealthRow[] = [];
  let totalCalls = 0;
  let total429 = 0;
  let total5xx = 0;
  let totalTimeouts = 0;

  for (const r of byModel.values()) {
    totalCalls += r.calls;
    total429 += r.rate429;
    total5xx += r.err5xx;
    totalTimeouts += r.timeouts;

    const avgMs = r.latencies.length ? Math.round(r.latencies.reduce((a, b) => a + b, 0) / r.latencies.length) : 0;
    const p95Ms = Math.round(percentile(r.latencies, 95));

    // Health score: 100 - penalties
    // Penalties: 429 rate * 30, 5xx rate * 40, timeout rate * 20, latency penalty
    const calls = Math.max(1, r.calls);
    const r429 = r.rate429 / calls;
    const r5xx = r.err5xx / calls;
    const rTo = r.timeouts / calls;
    const latencyPenalty = Math.min(10, p95Ms / 1000); // max 10 points for latency

    const score = Math.max(0, Math.min(100, Math.round(
      100 - (r429 * 30) - (r5xx * 40) - (rTo * 20) - latencyPenalty
    )));

    rows.push({
      provider: r.provider,
      model: r.model,
      calls: r.calls,
      rate429: r.rate429,
      err5xx: r.err5xx,
      timeouts: r.timeouts,
      avgMs,
      p95Ms,
      healthScore: score,
      lastSeen: r.lastSeen,
    });
  }

  // Sort by calls desc
  rows.sort((a, b) => b.calls - a.calls);

  return {
    range,
    generatedAt: new Date().toISOString(),
    totals: { calls: totalCalls, rate429: total429, err5xx: total5xx, timeouts: totalTimeouts },
    rows,
  };
}

export function suggestFallbacks(report: ModelHealthReport, minCalls: number = 20): FallbackSuggestion[] {
  const suggestions: FallbackSuggestion[] = [];
  const rows = report.rows.filter((r) => r.calls >= minCalls);

  // Group by provider
  const byProvider = new Map<string, ModelHealthRow[]>();
  for (const r of rows) {
    const arr = byProvider.get(r.provider) ?? [];
    arr.push(r);
    byProvider.set(r.provider, arr);
  }

  for (const [provider, models] of byProvider) {
    if (models.length < 2) continue;

    // Sort by health score desc
    const sorted = [...models].sort((a, b) => b.healthScore - a.healthScore);

    for (let i = 1; i < sorted.length; i++) {
      const worse = sorted[i]!;
      const better = sorted[0]!;

      if (better.healthScore <= worse.healthScore) continue;
      const delta = better.healthScore - worse.healthScore;
      if (delta < 5) continue; // Not significant

      let confidence: "high" | "medium" | "low" = "low";
      if (delta >= 20 && better.calls >= 50) confidence = "high";
      else if (delta >= 10) confidence = "medium";

      suggestions.push({
        from: { provider: worse.provider, model: worse.model },
        to: { provider: better.provider, model: better.model },
        confidence,
        reason: `${worse.model} has score ${worse.healthScore}, ${better.model} has score ${better.healthScore} (delta ${delta})`,
        metrics: { fromScore: worse.healthScore, toScore: better.healthScore, delta },
      });
    }
  }

  // Sort by delta desc
  suggestions.sort((a, b) => b.metrics.delta - a.metrics.delta);

  return suggestions;
}
