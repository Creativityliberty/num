import type { Policy } from "../core/policy.js";
import type { EventBus } from "../obs/events.js";
export declare function startMcpServer(opts: {
    modesPaths: string[];
    bus: EventBus;
    policy: Policy;
}): Promise<void>;
