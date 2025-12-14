import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ModesStore } from "../src/core/modes.store.js";
import { PolicySchema } from "../src/core/policy.js";
import { AgentsEngine } from "../src/server/agents/engine.js";

describe("12.6.1 mode.flow -> agents.plan({modeId})", () => {
  it("loads flow from mode json and builds jobs", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-modeflow-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    await fs.writeFile(
      path.join(modesPath, "my-mode.json"),
      JSON.stringify(
        {
          id: "my-mode",
          name: "My Mode",
          flow: {
            version: "1",
            name: "simple",
            nodes: [
              { id: "a", role: "planner", goal: "A", expectedSchema: "multiPlan", prompt: { system: "S", user: "Goal={{task.goal}}" } },
              { id: "b", role: "implementer", goal: "B", expectedSchema: "patchCandidate", prompt: { system: "S", user: "Use={{json artifacts.byNode.a}}" } }
            ],
            edges: [{ from: "a", to: "b" }]
          }
        },
        null,
        2
      )
    );

    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const modes = new ModesStore({ modesPath });
    const engine = new AgentsEngine({ policy, modes });

    const { runId } = await engine.plan({ task: { goal: "X" }, modeId: "my-mode" });
    const n1 = await engine.next({ runId });
    expect(n1.job?.jobId).toBe("a");
    expect(n1.nodeId).toBe("a");
    expect(n1.expectedSchema).toBe("multiPlan");
    expect(n1.promptPack?.user).toContain("Goal=X");
  });

  it("throws if mode has no flow", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-modeflow-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });
    await fs.writeFile(path.join(modesPath, "no-flow.json"), JSON.stringify({ id: "no-flow" }, null, 2));

    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const modes = new ModesStore({ modesPath });
    const engine = new AgentsEngine({ policy, modes });

    await expect(engine.plan({ task: { goal: "X" }, modeId: "no-flow" })).rejects.toThrow(/has no flow/i);
  });

  it("throws if modes store not configured", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-modeflow-"));
    const policy = PolicySchema.parse({ workspaceRoot: tmp });
    const engine = new AgentsEngine({ policy });

    await expect(engine.plan({ task: { goal: "X" }, modeId: "any" })).rejects.toThrow(/modes store not configured/i);
  });
});
