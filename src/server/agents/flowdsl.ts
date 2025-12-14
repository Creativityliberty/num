import { FlowSpecSchema, type AgentRole } from "../../core/schemas.js";

// Template helper: supports {{task.goal}}, {{json task.context}}, {{json artifacts}}
export function renderTemplate(tpl: string, ctx: any): string {
  const jsonRe = /\{\{\s*json\s+([a-zA-Z0-9_.]+)\s*\}\}/g;
  const varRe = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

  const get = (path: string) => {
    const parts = path.split(".");
    let cur: any = ctx;
    for (const p of parts) {
      if (cur == null) return "";
      cur = cur[p];
    }
    return cur ?? "";
  };

  const out1 = tpl.replace(jsonRe, (_, p1) => {
    try {
      return JSON.stringify(get(p1), null, 2);
    } catch {
      return "null";
    }
  });
  const out2 = out1.replace(varRe, (_, p1) => String(get(p1)));
  return out2;
}

export function normalizeFlowSpec(input: unknown) {
  const spec = FlowSpecSchema.parse(input);

  // Ensure unique node ids
  const ids = new Set<string>();
  for (const n of spec.nodes) {
    if (ids.has(n.id)) throw new Error(`FlowSpec: duplicate node id: ${n.id}`);
    ids.add(n.id);
  }

  // Validate edges refer to known nodes
  for (const e of spec.edges ?? []) {
    if (!ids.has(e.from)) throw new Error(`FlowSpec: edge.from unknown: ${e.from}`);
    if (!ids.has(e.to)) throw new Error(`FlowSpec: edge.to unknown: ${e.to}`);
  }

  return spec;
}

export function buildJobsFromFlow(spec: any) {
  const deps: Record<string, string[]> = {};
  for (const n of spec.nodes) deps[n.id] = [];
  for (const e of spec.edges ?? []) {
    if (!deps[e.to]) deps[e.to] = [];
    deps[e.to]!.push(e.from);
  }
  return spec.nodes.map((n: any) => ({
    jobId: n.id,
    role: n.role as AgentRole,
    goal: n.goal,
    dependsOn: deps[n.id] ?? [],
    status: "pending" as const,
  }));
}
