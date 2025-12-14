import fs from "node:fs";
import path from "node:path";
import type { ModesRegistry } from "../../core/modes.registry.js";

export type AgentDetail = {
  id: string;
  name?: string;
  tags?: string[];
  status?: string;
  isChef?: boolean;
  flow?: Record<string, unknown>;
  runtimePolicy?: Record<string, unknown>;
  lastRuns?: Record<string, unknown>[];
  healthMetrics?: Record<string, unknown>;
};

export async function getAgentDetail(registry: ModesRegistry, modeId: string): Promise<AgentDetail | null> {
  const mode = await registry.get(modeId);
  if (!mode) return null;

  return {
    id: modeId,
    name: mode.name as string | undefined,
    tags: mode.tags as string[] | undefined,
    status: "valid",
    isChef: false,
    flow: mode.flow as Record<string, unknown> | undefined,
    runtimePolicy: (mode as Record<string, unknown>).runtimePolicy as Record<string, unknown> | undefined,
    lastRuns: [],
    healthMetrics: {
      successRate: 0.95,
      avgDuration: 2300,
      modelUsage: { preferred: 0.85, fallback: 0.15 },
      costPerRun: 0.35,
    },
  };
}

export function getAgentRuns(root: string, modeId: string, limit: number = 5): Record<string, unknown>[] {
  const runsDir = path.join(root, ".mcp", "runs");
  if (!fs.existsSync(runsDir)) return [];

  const files = fs.readdirSync(runsDir).filter((f) => f.endsWith(".json"));
  const runs: Record<string, unknown>[] = [];

  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(runsDir, f), "utf-8");
      const run = JSON.parse(content) as Record<string, unknown>;
      if (run.modeId === modeId || run.mode === modeId) {
        const state = run.state as Record<string, unknown> | undefined;
        runs.push({
          id: f.replace(".json", ""),
          status: (state?.current as string) || (run.status as string) || "unknown",
          duration: (run.durationMs as number) || 0,
          modelUsed: (run.modelUsed as string) || "unknown",
          date: (run.ts as string) || (run.startedAt as string) || new Date().toISOString(),
        });
      }
    } catch {
      // skip corrupt files
    }
  }

  return runs.slice(0, limit);
}

export function getAgentHealth(root: string, modeId: string): Record<string, unknown> {
  const runsDir = path.join(root, ".mcp", "runs");
  if (!fs.existsSync(runsDir)) {
    return {
      successRate: 0,
      avgDuration: 0,
      modelUsage: { preferred: 0, fallback: 0 },
      costPerRun: 0,
      summary: { runs: 0, success: 0, failed: 0 },
    };
  }

  const files = fs.readdirSync(runsDir).filter((f) => f.endsWith(".json"));
  let total = 0,
    success = 0,
    failed = 0,
    totalDuration = 0,
    countDuration = 0;

  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(runsDir, f), "utf-8");
      const run = JSON.parse(content) as Record<string, unknown>;
      if (run.modeId === modeId || run.mode === modeId) {
        total++;
        const state = run.state as Record<string, unknown> | undefined;
        const status = String((state?.current as string) || (run.status as string) || "").toUpperCase();
        if (status.includes("DONE")) success++;
        else if (status.includes("FAIL")) failed++;

        const dur = (run.durationMs as number) || 0;
        if (dur > 0) {
          totalDuration += dur;
          countDuration++;
        }
      }
    } catch {
      // skip
    }
  }

  return {
    successRate: total > 0 ? success / total : 0,
    avgDuration: countDuration > 0 ? Math.round(totalDuration / countDuration) : 0,
    modelUsage: { preferred: 0.85, fallback: 0.15 },
    costPerRun: 0.35,
    summary: { runs: total, success, failed },
  };
}
