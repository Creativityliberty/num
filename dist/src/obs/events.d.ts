import { EventEmitter } from "node:events";
import type pino from "pino";
export type EventName = "runtime.started" | "tool.called" | "tool.succeeded" | "tool.failed";
export type BaseEvent = {
    ts: string;
    name: EventName;
    sessionId: string;
    data: Record<string, unknown>;
};
export type EventBus = EventEmitter & {
    emitEvent(name: EventName, ev: {
        sessionId?: string;
        data?: Record<string, unknown>;
        ts?: string;
    }): void;
    getSnapshot(): BaseEvent[];
};
type CreateEventBusOpts = {
    maxEvents: number;
    jsonlPath?: string;
    log: pino.Logger;
};
export declare function createEventBus(opts: CreateEventBusOpts): EventBus;
export {};
