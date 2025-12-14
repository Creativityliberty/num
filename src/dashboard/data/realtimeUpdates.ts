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

export class RealtimeManager {
  private subscriptions: Map<string, RealtimeSubscription[]> = new Map();
  private eventHistory: RealtimeEvent[] = [];
  private maxHistorySize: number = 100;

  subscribe(channel: string, callback: (event: RealtimeEvent) => void): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random()}`;
    const subscription: RealtimeSubscription = { id: subscriptionId, channel, callback };

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }
    this.subscriptions.get(channel)!.push(subscription);

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    for (const subs of this.subscriptions.values()) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
      }
    }
  }

  publish(channel: string, event: Omit<RealtimeEvent, "timestamp">): void {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Store in history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Publish to subscribers
    const subs = this.subscriptions.get(channel) || [];
    for (const sub of subs) {
      try {
        sub.callback(fullEvent);
      } catch (e) {
        console.error(`Error in subscription ${sub.id}:`, e);
      }
    }
  }

  getHistory(channel?: string, limit: number = 50): RealtimeEvent[] {
    if (!channel) {
      return this.eventHistory.slice(-limit);
    }
    return this.eventHistory.filter((e) => e.data.channel === channel).slice(-limit);
  }

  getChannels(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  getSubscriberCount(channel: string): number {
    return this.subscriptions.get(channel)?.length || 0;
  }
}

export function formatRealtimeEvent(event: RealtimeEvent): string {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const type = event.type.replace(/-/g, " ").toUpperCase();
  return `[${time}] ${type}: ${JSON.stringify(event.data)}`;
}

export function createAgentUpdateEvent(agentId: string, status: string, details?: Record<string, unknown>): RealtimeEvent {
  return {
    type: "agent-update",
    timestamp: new Date().toISOString(),
    data: {
      agentId,
      status,
      ...details,
    },
  };
}

export function createRunStartedEvent(runId: string, agentId: string, goal?: string): RealtimeEvent {
  return {
    type: "run-started",
    timestamp: new Date().toISOString(),
    data: {
      runId,
      agentId,
      goal,
    },
  };
}

export function createRunCompletedEvent(runId: string, agentId: string, status: string, duration: number): RealtimeEvent {
  return {
    type: "run-completed",
    timestamp: new Date().toISOString(),
    data: {
      runId,
      agentId,
      status,
      duration,
    },
  };
}

export function createHealthChangedEvent(agentId: string, healthScore: number, trend: string): RealtimeEvent {
  return {
    type: "health-changed",
    timestamp: new Date().toISOString(),
    data: {
      agentId,
      healthScore,
      trend,
    },
  };
}

export function createPackInstalledEvent(packId: string, version: string): RealtimeEvent {
  return {
    type: "pack-installed",
    timestamp: new Date().toISOString(),
    data: {
      packId,
      version,
    },
  };
}

export function createErrorEvent(error: string, context?: Record<string, unknown>): RealtimeEvent {
  return {
    type: "error",
    timestamp: new Date().toISOString(),
    data: {
      error,
      ...context,
    },
  };
}
