export type TimelineTick = {
  role: string;
  jobId: string;
  status: string;
  startMs?: number;
  endMs?: number;
  durationMs?: number;
  goal?: string;
  runtime?: any;
};

export type TimelineLane = {
  role: string;
  totalMs: number;
  jobs: TimelineTick[];
};

export type JobsTimeline = {
  lanes: TimelineLane[];
  bottleneckRole: string | null;
  bottleneckTotalMs: number;
  minMs?: number;
  maxMs?: number;
};

function toMs(iso: string): number {
  return Date.parse(iso);
}

export function buildJobsTimeline(run: any): JobsTimeline {
  const jobs = run?.agents?.jobs ?? [];
  const ticks: TimelineTick[] = [];
  const byRole = new Map<string, TimelineLane>();

  for (const j of jobs) {
    const role = j.role ?? "unknown";
    if (!byRole.has(role)) {
      byRole.set(role, { role, totalMs: 0, jobs: [] });
    }

    const s = j.startedAt ? toMs(j.startedAt) : undefined;
    const e = j.finishedAt ? toMs(j.finishedAt) : undefined;
    const d = s != null && e != null ? Math.max(0, e - s) : undefined;

    const t: TimelineTick = {
      role,
      jobId: j.jobId,
      status: j.status ?? "unknown",
      startMs: s,
      endMs: e,
      durationMs: d,
      goal: j.goal,
      runtime: j.runtime,
    };

    ticks.push(t);
    byRole.get(role)!.jobs.push(t);
    if (d != null) {
      byRole.get(role)!.totalMs += d;
    }
  }

  const lanes = Array.from(byRole.values()).sort((a, b) => b.totalMs - a.totalMs);
  const bottleneck = lanes.length ? lanes[0] : null;

  const starts = ticks.map((t) => t.startMs).filter((x): x is number => typeof x === "number");
  const ends = ticks.map((t) => t.endMs).filter((x): x is number => typeof x === "number");
  const minMs = starts.length ? Math.min(...starts) : undefined;
  const maxMs = ends.length ? Math.max(...ends) : undefined;

  return {
    lanes,
    bottleneckRole: bottleneck?.role ?? null,
    bottleneckTotalMs: bottleneck?.totalMs ?? 0,
    minMs,
    maxMs,
  };
}
