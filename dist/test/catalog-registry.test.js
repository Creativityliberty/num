import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ModesRegistry } from "../src/core/modes.registry.js";
describe("12.8 catalog → modes", () => {
    it("lists catalog agents as virtual modes", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cat-"));
        const modesPath = path.join(tmp, "modes");
        await fs.mkdir(modesPath, { recursive: true });
        const cat = {
            version: "1",
            namespace: "roo",
            agents: [
                {
                    id: "fix-bug",
                    name: "Fix Bug Agent",
                    tags: ["bugfix"],
                    flow: {
                        version: "1",
                        nodes: [
                            { id: "plan", role: "planner", goal: "Plan fix", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } },
                            { id: "impl", role: "implementer", goal: "Implement fix", expectedSchema: "patchCandidate", prompt: { system: "s", user: "u" } },
                        ],
                        edges: [{ from: "plan", to: "impl" }],
                    },
                },
                {
                    id: "disabled",
                    enabled: false,
                    flow: {
                        version: "1",
                        nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
                    },
                },
            ],
        };
        const catPath = path.join(tmp, "catalog.json");
        await fs.writeFile(catPath, JSON.stringify(cat, null, 2));
        const reg = new ModesRegistry({ modesPath, catalogPath: catPath });
        const list = await reg.list();
        const rooBug = list.find((m) => m.id === "roo:fix-bug");
        expect(rooBug).toBeTruthy();
        expect(rooBug?.source).toBe("CATALOG");
        expect(rooBug?.status).toBe("OK");
        expect(rooBug?.nodeCount).toBe(2);
        expect(rooBug?.tags).toContain("bugfix");
        // Disabled agent should not appear
        const disabled = list.find((m) => m.id === "roo:disabled");
        expect(disabled).toBeFalsy();
    });
    it("get() returns catalog mode detail", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cat-"));
        const modesPath = path.join(tmp, "modes");
        await fs.mkdir(modesPath, { recursive: true });
        const cat = {
            version: "1",
            namespace: "test",
            agents: [
                {
                    id: "a",
                    name: "Agent A",
                    flow: {
                        version: "1",
                        nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
                    },
                },
            ],
        };
        const catPath = path.join(tmp, "catalog.json");
        await fs.writeFile(catPath, JSON.stringify(cat, null, 2));
        const reg = new ModesRegistry({ modesPath, catalogPath: catPath });
        const detail = await reg.get("test:a");
        expect(detail).toBeTruthy();
        expect(detail?.source).toBe("CATALOG");
        expect(detail?.name).toBe("Agent A");
        expect(detail?.flow).toBeTruthy();
    });
    it("handles catalog without namespace", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cat-"));
        const modesPath = path.join(tmp, "modes");
        await fs.mkdir(modesPath, { recursive: true });
        const cat = {
            version: "1",
            agents: [
                {
                    id: "simple",
                    flow: {
                        version: "1",
                        nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
                    },
                },
            ],
        };
        const catPath = path.join(tmp, "catalog.json");
        await fs.writeFile(catPath, JSON.stringify(cat, null, 2));
        const reg = new ModesRegistry({ modesPath, catalogPath: catPath });
        const list = await reg.list();
        const simple = list.find((m) => m.id === "simple");
        expect(simple).toBeTruthy();
        expect(simple?.source).toBe("CATALOG");
    });
    it("reports catalog agent with cycle", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "cat-"));
        const modesPath = path.join(tmp, "modes");
        await fs.mkdir(modesPath, { recursive: true });
        const cat = {
            version: "1",
            agents: [
                {
                    id: "cyclic",
                    flow: {
                        version: "1",
                        nodes: [
                            { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } },
                            { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "s", user: "u" } },
                        ],
                        edges: [
                            { from: "a", to: "b" },
                            { from: "b", to: "a" },
                        ],
                    },
                },
            ],
        };
        const catPath = path.join(tmp, "catalog.json");
        await fs.writeFile(catPath, JSON.stringify(cat, null, 2));
        const reg = new ModesRegistry({ modesPath, catalogPath: catPath });
        const list = await reg.list();
        const cyclic = list.find((m) => m.id === "cyclic");
        expect(cyclic?.status).toBe("CYCLE");
        expect(cyclic?.source).toBe("CATALOG");
    });
});
//# sourceMappingURL=catalog-registry.test.js.map