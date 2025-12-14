import fs from "node:fs";
import path from "node:path";
export function publishPack(root, input) {
    try {
        const packPath = path.join(root, "packs", input.packId);
        if (!fs.existsSync(packPath)) {
            return { ok: false, packId: input.packId, version: input.version, error: "Pack not found" };
        }
        const marketplaceDir = path.join(root, ".mcp", "marketplace");
        if (!fs.existsSync(marketplaceDir))
            fs.mkdirSync(marketplaceDir, { recursive: true });
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
    }
    catch (e) {
        return {
            ok: false,
            packId: input.packId,
            version: input.version,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
export function installPack(root, input) {
    try {
        const version = input.version || "latest";
        const source = input.source || "https://marketplace.example.com";
        const packsDir = path.join(root, "packs", input.packId);
        if (!fs.existsSync(packsDir))
            fs.mkdirSync(packsDir, { recursive: true });
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
    }
    catch (e) {
        return {
            ok: false,
            packId: input.packId,
            version: input.version || "latest",
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
export function listMarketplacePacks(root) {
    try {
        const marketplaceDir = path.join(root, ".mcp", "marketplace");
        if (!fs.existsSync(marketplaceDir))
            return [];
        const files = fs.readdirSync(marketplaceDir).filter((f) => f.endsWith(".json"));
        return files.map((f) => {
            try {
                const content = fs.readFileSync(path.join(marketplaceDir, f), "utf-8");
                return JSON.parse(content);
            }
            catch {
                return null;
            }
        }).filter(Boolean);
    }
    catch {
        return [];
    }
}
