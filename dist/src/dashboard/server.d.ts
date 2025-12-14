import type pino from "pino";
import type { EventBus } from "../obs/events.js";
type StartDashboardOpts = {
    bus: EventBus;
    port: number;
    log: pino.Logger;
    workspaceRoot: string;
    policyPublic: {
        allowWrite: boolean;
        allowExec: boolean;
        allowGit: boolean;
        allowedCommands: string[];
        allowedWritePaths: string[];
        blockedWritePaths: string[];
        requireConfirmationFor: string[];
        rollbackCooldownSeconds: number;
    };
};
export declare function startDashboard(opts: StartDashboardOpts): Promise<{
    url: string;
}>;
export {};
