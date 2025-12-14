export type RealtimeEvent = {
    type: "agent-update" | "run-started" | "run-completed" | "health-changed" | "pack-installed" | "error";
    timestamp: string;
    data: Record<string, unknown>;
};
export type RealtimeSubscription = {
    id: string;
    channel: string;
    callback: (event: RealtimeEvent) => void;
};
export declare class RealtimeManager {
    private subscriptions;
    private eventHistory;
    private maxHistorySize;
    subscribe(channel: string, callback: (event: RealtimeEvent) => void): string;
    unsubscribe(subscriptionId: string): void;
    publish(channel: string, event: Omit<RealtimeEvent, "timestamp">): void;
    getHistory(channel?: string, limit?: number): RealtimeEvent[];
    getChannels(): string[];
    getSubscriberCount(channel: string): number;
}
export declare function formatRealtimeEvent(event: RealtimeEvent): string;
export declare function createAgentUpdateEvent(agentId: string, status: string, details?: Record<string, unknown>): RealtimeEvent;
export declare function createRunStartedEvent(runId: string, agentId: string, goal?: string): RealtimeEvent;
export declare function createRunCompletedEvent(runId: string, agentId: string, status: string, duration: number): RealtimeEvent;
export declare function createHealthChangedEvent(agentId: string, healthScore: number, trend: string): RealtimeEvent;
export declare function createPackInstalledEvent(packId: string, version: string): RealtimeEvent;
export declare function createErrorEvent(error: string, context?: Record<string, unknown>): RealtimeEvent;
