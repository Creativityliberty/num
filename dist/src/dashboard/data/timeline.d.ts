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
export declare function buildJobsTimeline(run: any): JobsTimeline;
