import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
describe("policy.rollbackCooldownSeconds (11.6)", () => {
    it("defaults to 300", () => {
        const p = PolicySchema.parse({ workspaceRoot: "/tmp" });
        expect(p.rollbackCooldownSeconds).toBe(300);
    });
    it("accepts 0 (no cooldown)", () => {
        const p = PolicySchema.parse({ workspaceRoot: "/tmp", rollbackCooldownSeconds: 0 });
        expect(p.rollbackCooldownSeconds).toBe(0);
    });
    it("accepts custom value", () => {
        const p = PolicySchema.parse({ workspaceRoot: "/tmp", rollbackCooldownSeconds: 60 });
        expect(p.rollbackCooldownSeconds).toBe(60);
    });
    it("accepts max value (24h)", () => {
        const p = PolicySchema.parse({ workspaceRoot: "/tmp", rollbackCooldownSeconds: 86400 });
        expect(p.rollbackCooldownSeconds).toBe(86400);
    });
    it("rejects negative values", () => {
        expect(() => PolicySchema.parse({ workspaceRoot: "/tmp", rollbackCooldownSeconds: -1 })).toThrow();
    });
    it("rejects values > 24h", () => {
        expect(() => PolicySchema.parse({ workspaceRoot: "/tmp", rollbackCooldownSeconds: 86401 })).toThrow();
    });
});
//# sourceMappingURL=policy-cooldown.test.js.map