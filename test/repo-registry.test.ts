import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ModesRegistry } from "../src/core/modes.registry.js";

describe("12.9 repo structured → modes", () => {
  it("loads modes from repo packs", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "repo-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    // Create pack structure
    const packDir = path.join(tmp, "roo-core");
    await fs.mkdir(path.join(packDir, "modes"), { recursive: true });

    await fs.writeFile(
      path.join(packDir, "pack.json"),
      JSON.stringify({ id: "roo-core", name: "Roo Core", version: "1.0.0", tags: ["core"] })
    );

    await fs.writeFile(
      path.join(packDir, "modes", "fix.json"),
      JSON.stringify({
        id: "fix",
        name: "Fix Mode",
        tags: ["bugfix"],
        flow: {
          version: "1",
          nodes: [
            { id: "plan", role: "planner", goal: "Plan", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } },
          ],
        },
      })
    );

    const reg = new ModesRegistry({ modesPath, repoPath: tmp });
    const list = await reg.list();

    const fix = list.find((m) => m.id === "roo-core:fix");
    expect(fix).toBeTruthy();
    expect(fix?.source).toBe("REPO");
    expect(fix?.status).toBe("OK");
    expect(fix?.pack?.id).toBe("roo-core");
    expect(fix?.pack?.version).toBe("1.0.0");
    expect(fix?.tags).toContain("core");
    expect(fix?.tags).toContain("bugfix");
  });

  it("get() returns repo mode detail", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "repo-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    const packDir = path.join(tmp, "test-pack");
    await fs.mkdir(path.join(packDir, "modes"), { recursive: true });

    await fs.writeFile(path.join(packDir, "pack.json"), JSON.stringify({ id: "test-pack", version: "2.0" }));

    await fs.writeFile(
      path.join(packDir, "modes", "agent.json"),
      JSON.stringify({
        id: "agent",
        name: "Test Agent",
        flow: {
          version: "1",
          nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
        },
      })
    );

    const reg = new ModesRegistry({ modesPath, repoPath: tmp });
    const detail = await reg.get("test-pack:agent");

    expect(detail).toBeTruthy();
    expect(detail?.source).toBe("REPO");
    expect(detail?.pack?.id).toBe("test-pack");
    expect(detail?.pack?.version).toBe("2.0");
    expect(detail?.flow).toBeTruthy();
  });

  it("skips disabled packs", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "repo-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    const packDir = path.join(tmp, "disabled-pack");
    await fs.mkdir(path.join(packDir, "modes"), { recursive: true });

    await fs.writeFile(path.join(packDir, "pack.json"), JSON.stringify({ id: "disabled-pack", enabled: false }));

    await fs.writeFile(
      path.join(packDir, "modes", "a.json"),
      JSON.stringify({
        id: "a",
        flow: {
          version: "1",
          nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
        },
      })
    );

    const reg = new ModesRegistry({ modesPath, repoPath: tmp });
    const list = await reg.list();

    const disabled = list.find((m) => m.id === "disabled-pack:a");
    expect(disabled).toBeFalsy();
  });

  it("aggregates FILE, CATALOG, and REPO sources", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "all-"));
    const modesPath = path.join(tmp, "modes");
    await fs.mkdir(modesPath, { recursive: true });

    // FILE mode
    await fs.writeFile(
      path.join(modesPath, "file-mode.json"),
      JSON.stringify({
        id: "file-mode",
        flow: {
          version: "1",
          nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
        },
      })
    );

    // CATALOG
    const catPath = path.join(tmp, "catalog.json");
    await fs.writeFile(
      catPath,
      JSON.stringify({
        version: "1",
        namespace: "cat",
        agents: [
          {
            id: "cat-agent",
            flow: {
              version: "1",
              nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
            },
          },
        ],
      })
    );

    // REPO
    const repoPath = path.join(tmp, "repo");
    const packDir = path.join(repoPath, "pack1");
    await fs.mkdir(path.join(packDir, "modes"), { recursive: true });
    await fs.writeFile(path.join(packDir, "pack.json"), JSON.stringify({ id: "pack1" }));
    await fs.writeFile(
      path.join(packDir, "modes", "repo-mode.json"),
      JSON.stringify({
        id: "repo-mode",
        flow: {
          version: "1",
          nodes: [{ id: "n", role: "planner", goal: "g", expectedSchema: "multiPlan", prompt: { system: "s", user: "u" } }],
        },
      })
    );

    const reg = new ModesRegistry({ modesPath, catalogPath: catPath, repoPath });
    const list = await reg.list();

    const fileMode = list.find((m) => m.id === "file-mode");
    const catMode = list.find((m) => m.id === "cat:cat-agent");
    const repoMode = list.find((m) => m.id === "pack1:repo-mode");

    expect(fileMode?.source).toBe("FILE");
    expect(catMode?.source).toBe("CATALOG");
    expect(repoMode?.source).toBe("REPO");
  });
});
