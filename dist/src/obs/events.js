import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
export function createEventBus(opts) {
    const bus = new EventEmitter();
    const ring = [];
    let jsonlStream;
    if (opts.jsonlPath) {
        const abs = path.resolve(opts.jsonlPath);
        jsonlStream = fs.createWriteStream(abs, { flags: "a" });
        opts.log.info({ jsonlPath: abs }, "Event JSONL enabled");
    }
    bus.emitEvent = (name, evLike) => {
        const ev = {
            ts: evLike.ts ?? new Date().toISOString(),
            name,
            sessionId: evLike.sessionId ?? "unknown",
            data: evLike.data ?? {},
        };
        ring.push(ev);
        if (ring.length > opts.maxEvents)
            ring.shift();
        if (jsonlStream) {
            try {
                jsonlStream.write(JSON.stringify(ev) + "\n");
            }
            catch (err) {
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
