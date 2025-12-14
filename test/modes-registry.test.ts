import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ModesRegistry, topoGroups } from "../src/core/modes.registry.js";

describe("12.7 Modes Registry", () => {
  it("topoGroups: parallel groups", () => {
    const spec = {
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { from: "a", to: "b" },
        { from: "a", to: "c" },
      ],
    };
    const g = topoGroups(spec);
    expect(g[0]).toEqual(["a"]);
    expect(g[1]!.sort()).toEqual(["b", "c"]);
  });

  it("topoGroups: detects cycle", () => {
    const spec = {
      nodes: [{ id: "a" }, { id: "b" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "a" },
      ],
    };
    expect(() => topoGroups(spec)).toThrow(/CYCLE/i);
  });

  it("topoGroups: serial chain", () => {
    const spec = {
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
      ],
    };
    const g = topoGroups(spec);
    expect(g).toEqual([["a"], ["b"], ["c"]]);
  });

  it("registry.list: returns modes with validation status", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-registry-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    // Valid mode
    await fs.writeFile(
      path.join(modesPath, "valid.json"),
      JSON.stringify({
        id: "valid",
        name: "Valid Mode",
        tags: ["test"],
        flow: {
          version: "1",
          nodes: [
            { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "S", user: "U" } },
            { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "S", user: "U" } },
          ],
          edges: [{ from: "a", to: "b" }],
        },
      })
    );

    // Mode without flow
    await fs.writeFile(
      path.join(modesPath, "noflow.json"),
      JSON.stringify({ id: "noflow", name: "No Flow" })
    );

    // Mode with cycle
    await fs.writeFile(
      path.join(modesPath, "cycle.json"),
      JSON.stringify({
        id: "cycle",
        flow: {
          version: "1",
          nodes: [
            { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "S", user: "U" } },
            { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "S", user: "U" } },
          ],
          edges: [
            { from: "a", to: "b" },
            { from: "b", to: "a" },
          ],
        },
      })
    );

    // Mode with invalid schema
    await fs.writeFile(
      path.join(modesPath, "badschema.json"),
      JSON.stringify({
        id: "badschema",
        flow: {
          version: "1",
          nodes: [{ id: "a", role: "planner", goal: "A", expectedSchema: "unknownSchema", prompt: { system: "S", user: "U" } }],
        },
      })
    );

    const registry = new ModesRegistry({ modesPath });
    const list = await registry.list();

    expect(list.length).toBe(4);

    const valid = list.find((m) => m.id === "valid");
    expect(valid?.status).toBe("OK");
    expect(valid?.nodeCount).toBe(2);
    expect(valid?.topo).toEqual([["a"], ["b"]]);

    const noflow = list.find((m) => m.id === "noflow");
    expect(noflow?.status).toBe("INVALID");
    expect(noflow?.errors?.[0]?.type).toBe("NO_FLOW");

    const cycle = list.find((m) => m.id === "cycle");
    expect(cycle?.status).toBe("CYCLE");

    const badschema = list.find((m) => m.id === "badschema");
    expect(badschema?.status).toBe("SCHEMA_MISMATCH");
  });

  it("registry.get: returns mode detail", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-registry-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    await fs.writeFile(
      path.join(modesPath, "test.json"),
      JSON.stringify({
        id: "test",
        name: "Test Mode",
        flow: {
          version: "1",
          nodes: [
            { id: "plan", role: "planner", goal: "Plan", expectedSchema: "multiPlan", prompt: { system: "S", user: "U" } },
          ],
        },
      })
    );

    const registry = new ModesRegistry({ modesPath });
    const detail = await registry.get("test");

    expect(detail?.id).toBe("test");
    expect(detail?.status).toBe("OK");
    expect(detail?.nodes?.length).toBe(1);
    expect(detail?.nodes?.[0]?.id).toBe("plan");
  });

  it("registry.simulate: returns ticks and blockedBy", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-registry-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    await fs.writeFile(
      path.join(modesPath, "sim.json"),
      JSON.stringify({
        id: "sim",
        flow: {
          version: "1",
          nodes: [
            { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "S", user: "U" } },
            { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "S", user: "U" } },
            { id: "c", role: "implementer", goal: "C", expectedSchema: "patchCandidate", prompt: { system: "S", user: "U" } },
          ],
          edges: [
            { from: "a", to: "b" },
            { from: "a", to: "c" },
          ],
        },
      })
    );

    const registry = new ModesRegistry({ modesPath });
    const sim = await registry.simulate("sim");

    expect(sim.ok).toBe(true);
    if (sim.ok) {
      expect(sim.ticks[0]).toEqual(["a"]);
      expect(sim.ticks[1]!.sort()).toEqual(["b", "c"]);
      expect(sim.blockedBy["b"]).toEqual(["a"]);
      expect(sim.blockedBy["c"]).toEqual(["a"]);
      expect(sim.parallel.length).toBe(1);
    }
  });

  it("registry.validate: returns validation result", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-registry-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    await fs.writeFile(
      path.join(modesPath, "val.json"),
      JSON.stringify({
        id: "val",
        flow: {
          version: "1",
          nodes: [{ id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "S", user: "U" } }],
        },
      })
    );

    const registry = new ModesRegistry({ modesPath });
    const result = await registry.validate("val");

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.topo).toEqual([["a"]]);
  });
});
