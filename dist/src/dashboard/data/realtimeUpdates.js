export class RealtimeManager {
    subscriptions = new Map();
    eventHistory = [];
    maxHistorySize = 100;
    subscribe(channel, callback) {
        const subscriptionId = `sub-${Date.now()}-${Math.random()}`;
        const subscription = { id: subscriptionId, channel, callback };
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, []);
        }
        this.subscriptions.get(channel).push(subscription);
        return subscriptionId;
    }
    unsubscribe(subscriptionId) {
        for (const subs of this.subscriptions.values()) {
            const index = subs.findIndex((s) => s.id === subscriptionId);
            if (index !== -1) {
                subs.splice(index, 1);
            }
        }
    }
    publish(channel, event) {
        const fullEvent = {
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
            }
            catch (e) {
                console.error(`Error in subscription ${sub.id}:`, e);
            }
        }
    }
    getHistory(channel, limit = 50) {
        if (!channel) {
            return this.eventHistory.slice(-limit);
        }
        return this.eventHistory.filter((e) => e.data.channel === channel).slice(-limit);
    }
    getChannels() {
        return Array.from(this.subscriptions.keys());
    }
    getSubscriberCount(channel) {
        return this.subscriptions.get(channel)?.length || 0;
    }
}
export function formatRealtimeEvent(event) {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const type = event.type.replace(/-/g, " ").toUpperCase();
    return `[${time}] ${type}: ${JSON.stringify(event.data)}`;
}
export function createAgentUpdateEvent(agentId, status, details) {
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
export function createRunStartedEvent(runId, agentId, goal) {
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
export function createRunCompletedEvent(runId, agentId, status, duration) {
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
export function createHealthChangedEvent(agentId, healthScore, trend) {
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
export function createPackInstalledEvent(packId, version) {
    return {
        type: "pack-installed",
        timestamp: new Date().toISOString(),
        data: {
            packId,
            version,
        },
    };
}
export function createErrorEvent(error, context) {
    return {
        type: "error",
        timestamp: new Date().toISOString(),
        data: {
            error,
            ...context,
        },
    };
}
