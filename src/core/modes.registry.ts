import fs from "node:fs/promises";
import path from "node:path";
import { normalizeFlowSpec } from "../server/agents/flowdsl.js";
import { CatalogStore } from "./catalog.store.js";
import { ModeSchema } from "./modes.schema.js";
import { RepoStore } from "./repo.store.js";

export type ValidationError = {
  type: "PARSE" | "NO_FLOW" | "CYCLE" | "SCHEMA_MISMATCH" | "EDGE_INVALID" | "NODE_DUPLICATE" | "CATALOG" | "REPO";
  message: string;
  nodeId?: string;
};

export type ModeSummary = {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  hasFlow: boolean;
  flowName?: string;
  nodeCount?: number;
  edgeCount?: number;
  status: "OK" | "INVALID" | "CYCLE" | "SCHEMA_MISMATCH";
  errors?: ValidationError[];
  topo?: string[][];
  source?: "FILE" | "CATALOG" | "REPO";
  pack?: { id: string; version?: string };
};

export type ModeDetail = ModeSummary & {
  flow?: any;
  nodes?: { id: string; role: string; goal: string; expectedSchema: string }[];
};

const ALLOWED_SCHEMAS = ["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"];

export class ModesRegistry {
  constructor(private opts: { modesPath: string; catalogPath?: string; repoPath?: string }) {}

  private async readModeFile(filename: string): Promise<{ raw: any; mode: any } | { error: ValidationError }> {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(this.opts.modesPath, filename), "utf-8"));
      const mode = ModeSchema.parse(raw);
      return { raw, mode };
    } catch (e: any) {
      return { error: { type: "PARSE", message: String(e?.message ?? e) } };
    }
  }

  async list(): Promise<ModeSummary[]> {
    let files: string[];
    try {
      files = (await fs.readdir(this.opts.modesPath)).filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }

    const out: ModeSummary[] = [];

    for (const f of files) {
      const result = await this.readModeFile(f);

      if ("error" in result) {
        out.push({
          id: f.replace(".json", ""),
          hasFlow: false,
          status: "SCHEMA_MISMATCH",
          errors: [result.error],
        });
        continue;
      }

      const { mode } = result;

      if (!mode.flow) {
        out.push({
          id: mode.id,
          name: mode.name,
          description: mode.description,
          tags: mode.tags,
          hasFlow: false,
          status: "INVALID",
          errors: [{ type: "NO_FLOW", message: "mode.flow missing" }],
        });
        continue;
      }

      const validation = this.validateFlow(mode.flow);

      out.push({
        id: mode.id,
        name: mode.name,
        description: mode.description,
        tags: mode.tags,
        hasFlow: true,
        flowName: mode.flow.name,
        nodeCount: mode.flow.nodes?.length ?? 0,
        edgeCount: mode.flow.edges?.length ?? 0,
        status: validation.status,
        errors: validation.errors.length > 0 ? validation.errors : undefined,
        topo: validation.topo,
        source: "FILE",
      });
    }

    // --- 12.8: Catalogue (virtual modes) ---
    if (this.opts.catalogPath) {
      try {
        const cat = await new CatalogStore({ catalogPath: this.opts.catalogPath }).load();
        for (const a of cat.agents) {
          if (!a.enabled) continue;
          const modeId = cat.namespace ? `${cat.namespace}:${a.id}` : a.id;
          try {
            const spec = normalizeFlowSpec(a.flow);
            const topo = topoGroups(spec);
            out.push({
              id: modeId,
              name: a.name,
              description: a.description,
              tags: a.tags,
              hasFlow: true,
              flowName: spec.name,
              nodeCount: spec.nodes.length,
              edgeCount: spec.edges?.length ?? 0,
              status: "OK",
              topo,
              source: "CATALOG",
            });
          } catch (e: any) {
            const msg = String(e?.message ?? e);
            out.push({
              id: modeId,
              name: a.name,
              tags: a.tags,
              hasFlow: true,
              status: msg.includes("CYCLE") ? "CYCLE" : "INVALID",
              errors: [{ type: "CATALOG", message: msg }],
              source: "CATALOG",
            });
          }
        }
      } catch (e: any) {
        out.push({
          id: "_catalog_error",
          hasFlow: false,
          status: "INVALID",
          errors: [{ type: "CATALOG", message: String(e?.message ?? e) }],
          source: "CATALOG",
        });
      }
    }

    // --- 12.9: Repo structured (packs) ---
    if (this.opts.repoPath) {
      try {
        const repo = new RepoStore({ repoPath: this.opts.repoPath });
        const items = await repo.load();
        for (const it of items) {
          const modeId = `${it.packId}:${it.mode.id}`;
          try {
            if (!it.mode.flow) throw new Error("mode.flow missing");
            const spec = normalizeFlowSpec(it.mode.flow);
            const topo = topoGroups(spec);
            out.push({
              id: modeId,
              name: it.mode.name,
              description: it.mode.description,
              tags: [...(it.packTags ?? []), ...(it.mode.tags ?? [])],
              hasFlow: true,
              flowName: spec.name,
              nodeCount: spec.nodes.length,
              edgeCount: spec.edges?.length ?? 0,
              status: "OK",
              topo,
              source: "REPO",
              pack: { id: it.packId, version: it.packVersion },
            });
          } catch (e: any) {
            const msg = String(e?.message ?? e);
            out.push({
              id: modeId,
              name: it.mode.name,
              hasFlow: true,
              status: msg.includes("CYCLE") ? "CYCLE" : "INVALID",
              errors: [{ type: "REPO", message: msg }],
              source: "REPO",
              pack: { id: it.packId, version: it.packVersion },
            });
          }
        }
      } catch (e: any) {
        out.push({
          id: "_repo_error",
          hasFlow: false,
          status: "INVALID",
          errors: [{ type: "REPO", message: String(e?.message ?? e) }],
          source: "REPO",
        });
      }
    }

    return out;
  }

  async get(id: string): Promise<ModeDetail | null> {
    // Try FILE source first
    const result = await this.readModeFile(`${id}.json`);

    if (!("error" in result)) {
      const { mode } = result;

      if (!mode.flow) {
        return {
          id: mode.id,
          name: mode.name,
          description: mode.description,
          tags: mode.tags,
          hasFlow: false,
          status: "INVALID",
          errors: [{ type: "NO_FLOW", message: "mode.flow missing" }],
          source: "FILE",
        };
      }

      const validation = this.validateFlow(mode.flow);

      return {
        id: mode.id,
        name: mode.name,
        description: mode.description,
        tags: mode.tags,
        hasFlow: true,
        flowName: mode.flow.name,
        nodeCount: mode.flow.nodes?.length ?? 0,
        edgeCount: mode.flow.edges?.length ?? 0,
        status: validation.status,
        errors: validation.errors.length > 0 ? validation.errors : undefined,
        topo: validation.topo,
        flow: mode.flow,
        nodes: mode.flow.nodes?.map((n: any) => ({
          id: n.id,
          role: n.role,
          goal: n.goal,
          expectedSchema: n.expectedSchema,
        })),
        source: "FILE",
      };
    }

    // Try CATALOG source (namespace:id format)
    if (this.opts.catalogPath) {
      try {
        const cat = await new CatalogStore({ catalogPath: this.opts.catalogPath }).load();
        for (const a of cat.agents) {
          if (!a.enabled) continue;
          const modeId = cat.namespace ? `${cat.namespace}:${a.id}` : a.id;
          if (modeId === id) {
            const spec = normalizeFlowSpec(a.flow);
            const topo = topoGroups(spec);
            return {
              id: modeId,
              name: a.name,
              description: a.description,
              tags: a.tags,
              hasFlow: true,
              flowName: spec.name,
              nodeCount: spec.nodes.length,
              edgeCount: spec.edges?.length ?? 0,
              status: "OK",
              topo,
              flow: a.flow,
              nodes: spec.nodes.map((n: any) => ({
                id: n.id,
                role: n.role,
                goal: n.goal,
                expectedSchema: n.expectedSchema,
              })),
              source: "CATALOG",
            };
          }
        }
      } catch {
        // Catalog load failed, continue
      }
    }

    // Try REPO source (packId:modeId format)
    if (this.opts.repoPath) {
      try {
        const repo = new RepoStore({ repoPath: this.opts.repoPath });
        const items = await repo.load();
        for (const it of items) {
          const modeId = `${it.packId}:${it.mode.id}`;
          if (modeId === id && it.mode.flow) {
            const spec = normalizeFlowSpec(it.mode.flow);
            const topo = topoGroups(spec);
            return {
              id: modeId,
              name: it.mode.name,
              description: it.mode.description,
              tags: [...(it.packTags ?? []), ...(it.mode.tags ?? [])],
              hasFlow: true,
              flowName: spec.name,
              nodeCount: spec.nodes.length,
              edgeCount: spec.edges?.length ?? 0,
              status: "OK",
              topo,
              flow: it.mode.flow,
              nodes: spec.nodes.map((n: any) => ({
                id: n.id,
                role: n.role,
                goal: n.goal,
                expectedSchema: n.expectedSchema,
              })),
              source: "REPO",
              pack: { id: it.packId, version: it.packVersion },
            };
          }
        }
      } catch {
        // Repo load failed, continue
      }
    }

    return null;
  }

  async validate(id: string): Promise<{ ok: boolean; errors: ValidationError[]; topo?: string[][] }> {
    const detail = await this.get(id);
    if (!detail) return { ok: false, errors: [{ type: "PARSE", message: "Mode not found" }] };
    return {
      ok: detail.status === "OK",
      errors: detail.errors ?? [],
      topo: detail.topo,
    };
  }

  async simulate(id: string): Promise<{ ok: boolean; ticks: string[][]; blockedBy: Record<string, string[]>; parallel: string[][] } | { ok: false; error: string }> {
    const detail = await this.get(id);
    if (!detail || !detail.topo) {
      return { ok: false, error: detail?.errors?.[0]?.message ?? "Mode not found or invalid" };
    }

    const blockedBy: Record<string, string[]> = {};
    for (const e of detail.flow?.edges ?? []) {
      if (!blockedBy[e.to]) blockedBy[e.to] = [];
      blockedBy[e.to]!.push(e.from);
    }

    const parallel = detail.topo.filter((g) => g.length > 1);

    return {
      ok: true,
      ticks: detail.topo,
      blockedBy,
      parallel,
    };
  }

  private validateFlow(flow: any): { status: "OK" | "INVALID" | "CYCLE" | "SCHEMA_MISMATCH"; errors: ValidationError[]; topo?: string[][] } {
    const errors: ValidationError[] = [];

    // 1. Normalize + validate basic structure
    let spec: any;
    try {
      spec = normalizeFlowSpec(flow);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("duplicate")) {
        errors.push({ type: "NODE_DUPLICATE", message: msg });
      } else if (msg.includes("unknown")) {
        errors.push({ type: "EDGE_INVALID", message: msg });
      } else {
        errors.push({ type: "PARSE", message: msg });
      }
      return { status: "INVALID", errors };
    }

    // 2. Check expectedSchema allowlist
    for (const n of spec.nodes) {
      if (!ALLOWED_SCHEMAS.includes(n.expectedSchema)) {
        errors.push({
          type: "SCHEMA_MISMATCH",
          message: `Node '${n.id}' has unknown expectedSchema '${n.expectedSchema}'`,
          nodeId: n.id,
        });
      }
    }

    // 3. Cycle detection via topoGroups
    let topo: string[][];
    try {
      topo = topoGroups(spec);
    } catch (e: any) {
      errors.push({ type: "CYCLE", message: "Flow contains a cycle" });
      return { status: "CYCLE", errors };
    }

    if (errors.length > 0) {
      return { status: "SCHEMA_MISMATCH", errors, topo };
    }

    return { status: "OK", errors: [], topo };
  }
}

// Kahn's algorithm for topological sort → groups per tick (parallel batches)
export function topoGroups(spec: any): string[][] {
  const nodes = new Set<string>(spec.nodes.map((n: any) => n.id));
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    indeg.set(n, 0);
    adj.set(n, []);
  }

  for (const e of spec.edges ?? []) {
    indeg.set(e.to, (indeg.get(e.to) || 0) + 1);
    const fromAdj = adj.get(e.from);
    if (fromAdj) fromAdj.push(e.to);
  }

  const q: string[] = [];
  for (const [n, d] of indeg) {
    if (d === 0) q.push(n);
  }

  const groups: string[][] = [];
  let seen = 0;

  while (q.length) {
    const batch = [...q];
    q.length = 0;
    groups.push(batch);
    seen += batch.length;

    for (const u of batch) {
      for (const v of adj.get(u) ?? []) {
        indeg.set(v, indeg.get(v)! - 1);
        if (indeg.get(v) === 0) q.push(v);
      }
    }
  }

  if (seen !== nodes.size) {
    throw new Error("CYCLE_DETECTED");
  }

  return groups;
}
