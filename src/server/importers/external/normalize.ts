import { ExternalAgent, ImportWarning } from "./types.js";

type ModeLike = Record<string, unknown>;

function safeSlug(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\-:]+/g, "-")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

// 20.0.1: Chef aliases - canonical IDs for cockpit/smoke
const CHEF_ALIASES: Array<{ fromSlug: string; toSlug: string; toName?: string }> = [
  { fromSlug: "sparc", toSlug: "orchestrator", toName: "Orchestrator" },
  { fromSlug: "workflow-orchestrator", toSlug: "workflow-orchestrator" },
  { fromSlug: "agent-organizer", toSlug: "agent-organizer" },
  { fromSlug: "error-coordinator", toSlug: "error-coordinator" },
  { fromSlug: "performance-monitor", toSlug: "performance-monitor" },
  { fromSlug: "knowledge-synthesizer", toSlug: "knowledge-synthesizer" },
];

const CANONICAL_CHEF_SLUGS = [
  "orchestrator",
  "workflow-orchestrator",
  "agent-organizer",
  "error-coordinator",
  "performance-monitor",
  "knowledge-synthesizer",
];

// Very lightweight workflow selection:
// - command -> implement flow (may propose exec)
// - browser -> research flow
// - mcp -> tool-driven flow
// - else -> solo
export function selectFlowTemplate(groups: string[] = []) {
  const g = groups.map((x) => x.toLowerCase());
  const has = (k: string) => g.includes(k);
  if (has("command")) return "num.flow.plan-implement-review-security";
  if (has("browser")) return "num.flow.plan-research-synthesize";
  if (has("mcp")) return "num.flow.tool-driven";
  return "num.flow.solo";
}

export function groupsToTags(groups: string[] = []) {
  const g = groups.map((x) => x.toLowerCase());
  const tags: string[] = [];
  for (const x of g) {
    if (["read", "edit", "browser", "command", "mcp"].includes(x)) tags.push(x);
    else tags.push(x.replace(/\s+/g, "-"));
  }
  // a few friendly aliases
  if (g.includes("command")) tags.push("needs-exec");
  if (g.includes("browser")) tags.push("needs-browser");
  if (g.includes("mcp")) tags.push("needs-mcp");
  return uniq(tags);
}

export type NormalizeOpts = {
  idPrefix: string;
  aliasChefs?: boolean;
  ensureChefStubs?: boolean;
  chefStubMode?: "disabled" | "enabled";
};

export function normalizeExternalAgents(input: ExternalAgent[], opts: NormalizeOpts) {
  const warnings: ImportWarning[] = [];
  const out: ModeLike[] = [];
  for (const a of input) {
    const slug = safeSlug(a.slug);
    if (!slug) {
      warnings.push({ kind: "SKIP", message: "Missing slug", ref: a.name });
      continue;
    }
    const id = `${opts.idPrefix}${slug}`;
    const groups = Array.isArray(a.groups) ? a.groups : [];
    let tags = groupsToTags(groups);
    const flowTemplate = selectFlowTemplate(groups);

    // Tag as chef if this slug is a known chef
    if (isChefSlug(slug)) {
      tags = uniq([...tags, "chef"]);
    }

    const promptText = [
      a.roleDefinition ? `ROLE:\n${a.roleDefinition}` : "",
      a.whenToUse ? `WHEN TO USE:\n${a.whenToUse}` : "",
      a.description ? `DESCRIPTION:\n${a.description}` : "",
      a.customInstructions ? `INSTRUCTIONS:\n${a.customInstructions}` : "",
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    const flow = buildFlowFromTemplate(flowTemplate, promptText);
    out.push({
      id,
      name: a.name ?? slug,
      tags,
      source: a.source ?? "external",
      version: a.version ?? "1.0.0",
      flow,
    });
  }

  // 20.0.1: Add chef aliases (sparc -> orchestrator)
  let modes = opts.aliasChefs !== false ? addChefAliases(out, opts.idPrefix, warnings) : out;

  // 20.0.2: Ensure chef stubs exist
  if (opts.ensureChefStubs !== false) {
    modes = ensureChefStubs(modes, opts.idPrefix, warnings, opts.chefStubMode ?? "disabled");
  }

  return { modes, warnings };
}

function isChefSlug(slug: string) {
  return CHEF_ALIASES.some((x) => x.fromSlug === slug || x.toSlug === slug) ||
         CANONICAL_CHEF_SLUGS.includes(slug);
}

function addChefAliases(modes: ModeLike[], idPrefix: string, warnings: ImportWarning[]) {
  const byId = new Map<string, ModeLike>();
  for (const m of modes) byId.set(String(m.id), m);

  const bySlug = new Map<string, ModeLike>();
  for (const m of modes) {
    const id = String(m.id);
    const slug = id.includes(":") ? id.split(":")[1]! : id;
    bySlug.set(slug, m);
  }

  const out = [...modes];
  for (const a of CHEF_ALIASES) {
    const src = bySlug.get(a.fromSlug);
    if (!src) continue;

    const targetId = `${idPrefix}${a.toSlug}`;
    if (byId.has(targetId)) {
      const existing = byId.get(targetId)!;
      existing.tags = uniq([...((existing.tags as string[]) ?? []), "chef"]);
      continue;
    }

    // Create alias mode
    const alias: ModeLike = {
      ...src,
      id: targetId,
      name: a.toName ?? src.name,
      tags: uniq([...((src.tags as string[]) ?? []), "chef", "alias"]),
      source: src.source ?? "external",
    };
    out.push(alias);
    byId.set(targetId, alias);
    warnings.push({
      kind: "ALIAS_CREATED",
      message: `Created chef alias ${targetId} from ${String(src.id)}`,
      ref: String(src.id),
    });
  }

  return out;
}

function ensureChefStubs(
  modes: ModeLike[],
  idPrefix: string,
  warnings: ImportWarning[],
  stubMode: "disabled" | "enabled"
) {
  const byId = new Map<string, ModeLike>();
  for (const m of modes) byId.set(String(m.id), m);

  const out = [...modes];
  for (const slug of CANONICAL_CHEF_SLUGS) {
    const id = `${idPrefix}${slug}`;
    if (byId.has(id)) {
      const m = byId.get(id)!;
      m.tags = uniq([...((m.tags as string[]) ?? []), "chef"]);
      continue;
    }

    const stub = buildChefStub(id, slug, stubMode);
    out.push(stub);
    byId.set(id, stub);
    warnings.push({
      kind: "CHEF_STUB_CREATED",
      message: `Created missing chef stub ${id} (mode=${stubMode})`,
      ref: id,
    });
  }
  return out;
}

function buildChefStub(id: string, slug: string, stubMode: "disabled" | "enabled"): ModeLike {
  const name = slug
    .split("-")
    .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
    .join(" ");

  const enabled = stubMode === "enabled";
  const promptText = [
    `You are ${name}, a "chef" meta-agent in the Num Agents system.`,
    "",
    "If you are a stub, you must:",
    "- clearly state you are a stub",
    "- provide minimal safe behavior",
    "- recommend installing the full pack version if available",
    "",
    "Primary duties:",
    "- Orchestrate workflows safely and deterministically",
    "- Prefer policy-compliant actions only",
    "- Produce structured outputs that match expectedSchema",
  ].join("\n");

  return {
    id,
    name: `${name}${enabled ? "" : " (stub)"}`,
    tags: ["chef", "stub", "meta"],
    source: "generated",
    version: "1.0.0",
    disabled: !enabled,
    flow: {
      version: "1",
      nodes: [
        {
          id: "solo",
          role: "planner",
          goal: "Coordinate",
          expectedSchema: "multiPlan",
          prompt: { kind: "text", text: promptText },
        },
      ],
      edges: [],
    },
  };
}

function buildFlowFromTemplate(templateId: string, promptText: string) {
  // We keep expectedSchema compatible with your allowlist:
  // multiPlan | patchCandidate | reviewReport | securityReport (already in your app).
  if (templateId === "num.flow.plan-implement-review-security") {
    return {
      version: "1",
      nodes: [
        { id: "plan", role: "planner", goal: "Plan", expectedSchema: "multiPlan", prompt: { kind: "text", text: promptText } },
        { id: "impl", role: "implementer", goal: "Implement", expectedSchema: "patchCandidate", prompt: { kind: "text", text: promptText } },
        { id: "review", role: "reviewer", goal: "Review", expectedSchema: "reviewReport", prompt: { kind: "text", text: promptText } },
        { id: "security", role: "security", goal: "Security check", expectedSchema: "securityReport", prompt: { kind: "text", text: promptText } },
      ],
      edges: [
        { from: "plan", to: "impl" },
        { from: "impl", to: "review" },
        { from: "impl", to: "security" },
      ],
    };
  }

  if (templateId === "num.flow.plan-research-synthesize") {
    return {
      version: "1",
      nodes: [
        { id: "plan", role: "planner", goal: "Plan", expectedSchema: "multiPlan", prompt: { kind: "text", text: promptText } },
        { id: "research", role: "planner", goal: "Research", expectedSchema: "multiPlan", prompt: { kind: "text", text: promptText } },
        { id: "review", role: "reviewer", goal: "Review", expectedSchema: "reviewReport", prompt: { kind: "text", text: promptText } },
      ],
      edges: [
        { from: "plan", to: "research" },
        { from: "research", to: "review" },
      ],
    };
  }

  if (templateId === "num.flow.tool-driven") {
    return {
      version: "1",
      nodes: [
        { id: "plan", role: "planner", goal: "Plan tools usage", expectedSchema: "multiPlan", prompt: { kind: "text", text: promptText } },
        { id: "impl", role: "implementer", goal: "Execute via tools", expectedSchema: "patchCandidate", prompt: { kind: "text", text: promptText } },
        { id: "review", role: "reviewer", goal: "Review", expectedSchema: "reviewReport", prompt: { kind: "text", text: promptText } },
      ],
      edges: [
        { from: "plan", to: "impl" },
        { from: "impl", to: "review" },
      ],
    };
  }

  // solo default
  return {
    version: "1",
    nodes: [
      { id: "solo", role: "planner", goal: "Deliver", expectedSchema: "multiPlan", prompt: { kind: "text", text: promptText } },
    ],
    edges: [],
  };
}
