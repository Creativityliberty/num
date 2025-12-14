import fs from "node:fs";
import path from "node:path";

export type CatalogMode = {
  id: string;
  name: string;
  tags: string[];
  capabilities: string[];
  isChef: boolean;
  isStub: boolean;
  isAlias: boolean;
  disabled: boolean;
  source: string;
  version: string;
  flow: { nodes: number; edges: number };
};

export type CatalogStats = {
  total: number;
  byTag: Record<string, number>;
  byCapability: Record<string, number>;
  chefs: number;
  stubs: number;
  aliases: number;
  disabled: number;
  enabled: number;
};

export type Catalog = {
  packId: string;
  count: number;
  generatedAt: string;
  stats: CatalogStats;
  modes: CatalogMode[];
};

const CAPABILITIES = ["read", "edit", "browser", "command", "mcp"];

function extractCapabilities(tags: string[]): string[] {
  return tags.filter((t) => CAPABILITIES.includes(t.toLowerCase()));
}

function inc(obj: Record<string, number>, k: string) {
  obj[k] = (obj[k] ?? 0) + 1;
}

export function buildCatalog(opts: {
  packId: string;
  modesDir: string;
}): Catalog {
  const modes: CatalogMode[] = [];
  const stats: CatalogStats = {
    total: 0,
    byTag: {},
    byCapability: {},
    chefs: 0,
    stubs: 0,
    aliases: 0,
    disabled: 0,
    enabled: 0,
  };

  if (!fs.existsSync(opts.modesDir)) {
    return {
      packId: opts.packId,
      count: 0,
      generatedAt: new Date().toISOString(),
      stats,
      modes: [],
    };
  }

  const files = fs.readdirSync(opts.modesDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(opts.modesDir, file), "utf-8");
      const m = JSON.parse(raw);
      const tags = Array.isArray(m.tags) ? m.tags.map(String) : [];
      const capabilities = extractCapabilities(tags);
      const isChef = tags.includes("chef");
      const isStub = tags.includes("stub");
      const isAlias = tags.includes("alias");
      const disabled = !!m.disabled;

      const entry: CatalogMode = {
        id: String(m.id ?? file.replace(/\.json$/, "")),
        name: String(m.name ?? m.id ?? file),
        tags,
        capabilities,
        isChef,
        isStub,
        isAlias,
        disabled,
        source: String(m.source ?? "unknown"),
        version: String(m.version ?? "1.0.0"),
        flow: {
          nodes: Array.isArray(m.flow?.nodes) ? m.flow.nodes.length : 0,
          edges: Array.isArray(m.flow?.edges) ? m.flow.edges.length : 0,
        },
      };

      modes.push(entry);
      stats.total++;

      for (const t of tags) inc(stats.byTag, t);
      for (const c of capabilities) inc(stats.byCapability, c);
      if (isChef) stats.chefs++;
      if (isStub) stats.stubs++;
      if (isAlias) stats.aliases++;
      if (disabled) stats.disabled++;
      else stats.enabled++;
    } catch {
      // Skip corrupt files
    }
  }

  return {
    packId: opts.packId,
    count: modes.length,
    generatedAt: new Date().toISOString(),
    stats,
    modes,
  };
}

export function writeCatalog(opts: {
  packId: string;
  modesDir: string;
  packOutDir: string;
}): { catalogPath: string; catalog: Catalog } {
  const catalog = buildCatalog({ packId: opts.packId, modesDir: opts.modesDir });
  fs.mkdirSync(opts.packOutDir, { recursive: true });
  const catalogPath = path.join(opts.packOutDir, "catalog.json");
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
  return { catalogPath, catalog };
}

export function loadCatalog(packOutDir: string): Catalog | null {
  const catalogPath = path.join(packOutDir, "catalog.json");
  if (!fs.existsSync(catalogPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  } catch {
    return null;
  }
}
