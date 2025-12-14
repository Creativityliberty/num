import fs from "node:fs";
import path from "node:path";
export async function installPackFromBundle(opts) {
    // Load bundle
    let bundle;
    try {
        const raw = fs.readFileSync(opts.bundlePath, "utf-8");
        bundle = JSON.parse(raw);
    }
    catch (e) {
        return { ok: false, error: `BUNDLE_PARSE_ERROR: ${e instanceof Error ? e.message : String(e)}` };
    }
    const packId = bundle.pack?.id;
    if (!packId) {
        return { ok: false, error: "MISSING_PACK_ID" };
    }
    const modes = bundle.modes ?? [];
    if (!Array.isArray(modes) || modes.length === 0) {
        return { ok: false, error: "NO_MODES_IN_BUNDLE" };
    }
    // Create directories
    const modesDir = path.join(opts.workspaceRoot, "modes", packId.replace("-pack", ""));
    const packOutDir = path.join(opts.workspaceRoot, "packs", packId);
    fs.mkdirSync(modesDir, { recursive: true });
    fs.mkdirSync(packOutDir, { recursive: true });
    // Write modes
    for (const mode of modes) {
        const id = String(mode.id ?? "");
        const slug = id.includes(":") ? id.split(":")[1] : id;
        if (!slug)
            continue;
        const filePath = path.join(modesDir, `${slug}.json`);
        fs.writeFileSync(filePath, JSON.stringify(mode, null, 2), "utf-8");
    }
    // Write pack.json
    const packJsonPath = path.join(packOutDir, "pack.json");
    const packData = {
        id: packId,
        version: bundle.pack?.version ?? "1.0.0",
        name: bundle.pack?.name ?? packId,
        description: "Installed from marketplace bundle.",
        modesDir: path.relative(packOutDir, modesDir).replace(/\\/g, "/"),
        installedAt: new Date().toISOString(),
        installedFrom: path.basename(opts.bundlePath),
    };
    fs.writeFileSync(packJsonPath, JSON.stringify(packData, null, 2), "utf-8");
    // Copy bundle to .mcp/packs for reference
    const mcpPacksDir = path.join(opts.workspaceRoot, ".mcp", "packs");
    fs.mkdirSync(mcpPacksDir, { recursive: true });
    const bundleCopyPath = path.join(mcpPacksDir, path.basename(opts.bundlePath));
    fs.copyFileSync(opts.bundlePath, bundleCopyPath);
    return {
        ok: true,
        packId,
        modesInstalled: modes.length,
        modesDir,
        packJsonPath,
    };
}
