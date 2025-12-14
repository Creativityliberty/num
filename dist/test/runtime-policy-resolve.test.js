import { describe, expect, it } from "vitest";
import { resolveRuntimePolicy } from "../src/core/policy.resolve.js";
describe("13.1 runtime policy resolve", () => {
    it("node > mode > pack > defaults", () => {
        const r = resolveRuntimePolicy({
            defaults: { model: { preferred: { provider: "openai", model: "default-model" } } },
            pack: { model: { preferred: { provider: "openai", model: "pack-model" } } },
            mode: { model: { preferred: { provider: "openai", model: "mode-model" } } },
            node: { model: { preferred: { provider: "openai", model: "node-model" } } },
        });
        expect(r.model?.preferred?.model).toBe("node-model");
    });
    it("mode > pack > defaults when no node", () => {
        const r = resolveRuntimePolicy({
            defaults: { model: { preferred: { provider: "openai", model: "default-model" } } },
            pack: { model: { preferred: { provider: "openai", model: "pack-model" } } },
            mode: { model: { preferred: { provider: "openai", model: "mode-model" } } },
        });
        expect(r.model?.preferred?.model).toBe("mode-model");
    });
    it("pack > defaults when no mode", () => {
        const r = resolveRuntimePolicy({
            defaults: { model: { preferred: { provider: "openai", model: "default-model" } } },
            pack: { model: { preferred: { provider: "openai", model: "pack-model" } } },
        });
        expect(r.model?.preferred?.model).toBe("pack-model");
    });
    it("defaults when nothing else", () => {
        const r = resolveRuntimePolicy({
            defaults: { model: { preferred: { provider: "openai", model: "default-model" } } },
        });
        expect(r.model?.preferred?.model).toBe("default-model");
    });
    it("merges budget from mode when node has no budget", () => {
        const r = resolveRuntimePolicy({
            mode: { budget: { maxTokens: 50000 } },
            node: { model: { preferred: { provider: "openai", model: "node-model" } } },
        });
        expect(r.model?.preferred?.model).toBe("node-model");
        expect(r.budget?.maxTokens).toBe(50000);
    });
    it("node budget overrides mode budget", () => {
        const r = resolveRuntimePolicy({
            mode: { budget: { maxTokens: 50000 } },
            node: { budget: { maxTokens: 10000 } },
        });
        expect(r.budget?.maxTokens).toBe(10000);
    });
    it("rateLimit from pack when mode has none", () => {
        const r = resolveRuntimePolicy({
            pack: { rateLimit: { rpm: 30 } },
            mode: { model: { preferred: { provider: "openai", model: "m" } } },
        });
        expect(r.rateLimit?.rpm).toBe(30);
        expect(r.model?.preferred?.model).toBe("m");
    });
});
//# sourceMappingURL=runtime-policy-resolve.test.js.map