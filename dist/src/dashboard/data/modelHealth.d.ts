export type ModelRef = {
    provider: string;
    model: string;
};
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
    totals: {
        calls: number;
        rate429: number;
        err5xx: number;
        timeouts: number;
    };
    rows: ModelHealthRow[];
};
export type FallbackSuggestion = {
    from: ModelRef;
    to: ModelRef;
    confidence: "high" | "medium" | "low";
    reason: string;
    metrics: {
        fromScore: number;
        toScore: number;
        delta: number;
    };
};
export declare function loadTelemetryEvents(root: string): TelemetryEvent[];
export declare function computeModelHealthFromEvents(events: TelemetryEvent[], range: string): ModelHealthReport;
export declare function suggestFallbacks(report: ModelHealthReport, minCalls?: number): FallbackSuggestion[];
