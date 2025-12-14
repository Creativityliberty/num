type ScoreRow = {
    id: string;
    runs: number;
    done: number;
    failed: number;
    cancelled: number;
    score: number;
    successRate: number | null;
    avgDurationMs: number | null;
};
export declare function computeScoring(root: string, range: string, q?: string, tagContains?: string): ScoreRow[];
export declare function suggestAgents(scored: ScoreRow[], goal: string): ScoreRow[];
export {};
