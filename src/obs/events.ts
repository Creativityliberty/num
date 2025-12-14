import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import type pino from "pino";

export type EventName =
  | "runtime.started"
  | "tool.called"
  | "tool.succeeded"
  | "tool.failed";

export type BaseEvent = {
  ts: string;        // ISO
  name: EventName;
  sessionId: string; // correlation id
  data: Record<string, unknown>;
};

export type EventBus = EventEmitter & {
  emitEvent(
    name: EventName,
    ev: {
      sessionId?: string;
      data?: Record<string, unknown>;
      ts?: string;
    }
  ): void;
  getSnapshot(): BaseEvent[];
};

type CreateEventBusOpts = {
  maxEvents: number;
  jsonlPath?: string;
  log: pino.Logger;
};

export function createEventBus(opts: CreateEventBusOpts): EventBus {
  const bus = new EventEmitter() as EventBus;
  const ring: BaseEvent[] = [];

  let jsonlStream: fs.WriteStream | undefined;
  if (opts.jsonlPath) {
    const abs = path.resolve(opts.jsonlPath);
    jsonlStream = fs.createWriteStream(abs, { flags: "a" });
    opts.log.info({ jsonlPath: abs }, "Event JSONL enabled");
  }

  bus.emitEvent = (name, evLike) => {
    const ev: BaseEvent = {
      ts: evLike.ts ?? new Date().toISOString(),
      name,
      sessionId: evLike.sessionId ?? "unknown",
      data: evLike.data ?? {},
    };

    ring.push(ev);
    if (ring.length > opts.maxEvents) ring.shift();

    if (jsonlStream) {
      try {
        jsonlStream.write(JSON.stringify(ev) + "\n");
      } catch (err) {
        opts.log.warn({ err }, "Failed writing JSONL event");
      }
    }

    // IMPORTANT: listeners receive the full BaseEvent
    bus.emit(name, ev);
  };

  bus.getSnapshot = () => ring.slice();

  bus.on("error", (err) => {
    opts.log.warn({ err }, "EventBus error");
  });

  return bus;
}
