import fs from "node:fs";
import path from "node:path";

export type PublishPackInput = {
  packId: string;
  version: string;
  description?: string;
  tags?: string[];
  author?: string;
};

export type InstallPackInput = {
  packId: string;
  version?: string;
  source?: string;
};

export type MarketplaceResult = {
  ok: boolean;
  packId: string;
  version: string;
  message?: string;
  error?: string;
};

export function publishPack(root: string, input: PublishPackInput): MarketplaceResult {
  try {
    const packPath = path.join(root, "packs", input.packId);
    if (!fs.existsSync(packPath)) {
      return { ok: false, packId: input.packId, version: input.version, error: "Pack not found" };
    }

    const marketplaceDir = path.join(root, ".mcp", "marketplace");
    if (!fs.existsSync(marketplaceDir)) fs.mkdirSync(marketplaceDir, { recursive: true });

    const publishedPath = path.join(marketplaceDir, `${input.packId}-${input.version}.json`);
    const publishData = {
      packId: input.packId,
      version: input.version,
      description: input.description || "",
      tags: input.tags || [],
      author: input.author || "unknown",
      publishedAt: new Date().toISOString(),
      url: `https://marketplace.example.com/packs/${input.packId}/${input.version}`,
    };

    fs.writeFileSync(publishedPath, JSON.stringify(publishData, null, 2));
    return {
      ok: true,
      packId: input.packId,
      version: input.version,
      message: `Pack published: ${input.packId}@${input.version}`,
    };
  } catch (e: unknown) {
    return {
      ok: false,
      packId: input.packId,
      version: input.version,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function installPack(root: string, input: InstallPackInput): MarketplaceResult {
  try {
    const version = input.version || "latest";
    const source = input.source || "https://marketplace.example.com";

    const packsDir = path.join(root, "packs", input.packId);
    if (!fs.existsSync(packsDir)) fs.mkdirSync(packsDir, { recursive: true });

    const installData = {
      packId: input.packId,
      version,
      source,
      installedAt: new Date().toISOString(),
      enabled: true,
    };

    const installPath = path.join(packsDir, "install.json");
    fs.writeFileSync(installPath, JSON.stringify(installData, null, 2));

    return {
      ok: true,
      packId: input.packId,
      version,
      message: `Pack installed: ${input.packId}@${version}`,
    };
  } catch (e: unknown) {
    return {
      ok: false,
      packId: input.packId,
      version: input.version || "latest",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function listMarketplacePacks(root: string): Record<string, unknown>[] {
  try {
    const marketplaceDir = path.join(root, ".mcp", "marketplace");
    if (!fs.existsSync(marketplaceDir)) return [];

    const files = fs.readdirSync(marketplaceDir).filter((f) => f.endsWith(".json"));
    return files.map((f) => {
      try {
        const content = fs.readFileSync(path.join(marketplaceDir, f), "utf-8");
        return JSON.parse(content);
      } catch {
        return null;
      }
    }).filter(Boolean) as Record<string, unknown>[];
  } catch {
    return [];
  }
}
