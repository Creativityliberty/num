import fs from "node:fs";
import path from "node:path";
// Writes:
// - modes JSON files into outModesDir
// - pack.json into packOutDir
// - optional bundle into .mcp/packs
export async function buildNumPack(opts) {
    const written = [];
    const packJsonPath = path.join(opts.packOutDir, "pack.json");
    if (!opts.dryRun) {
        fs.mkdirSync(opts.outModesDir, { recursive: true });
        fs.mkdirSync(opts.packOutDir, { recursive: true });
    }
    for (const mode of opts.modes) {
        const id = String(mode.id);
        const slug = id.includes(":") ? id.split(":")[1] : id;
        const filePath = path.join(opts.outModesDir, `${slug}.json`);
        written.push(filePath);
        if (opts.dryRun)
            continue;
        // 20.0.3: upgrade logic for chef stubs
        const incomingIsStub = isStubMode(mode);
        const incomingIsDisabledStub = incomingIsStub && mode?.disabled === true;
        if (fs.existsSync(filePath)) {
            try {
                const existingRaw = fs.readFileSync(filePath, "utf-8");
                const existing = JSON.parse(existingRaw);
                const existingIsStub = isStubMode(existing);
                const existingIsDisabledStub = existingIsStub && existing?.disabled === true;
                // If existing is a disabled stub and incoming is real -> upgrade
                if (existingIsDisabledStub && !incomingIsDisabledStub) {
                    fs.writeFileSync(filePath, JSON.stringify(mode, null, 2), "utf-8");
                    opts.warnings?.push({
                        kind: "CHEF_STUB_UPGRADED",
                        message: `Upgraded stub -> real for ${id}`,
                        ref: filePath,
                    });
                    continue;
                }
                // If existing is real and incoming is stub -> keep existing
                if (!existingIsDisabledStub && incomingIsDisabledStub) {
                    opts.warnings?.push({
                        kind: "KEEP_REAL_OVER_STUB",
                        message: `Kept real mode, ignored incoming stub for ${id}`,
                        ref: filePath,
                    });
                    continue;
                }
                // Otherwise default: overwrite (latest import wins)
                fs.writeFileSync(filePath, JSON.stringify(mode, null, 2), "utf-8");
                continue;
            }
            catch {
                // If existing file is corrupted, overwrite safely
                fs.writeFileSync(filePath, JSON.stringify(mode, null, 2), "utf-8");
                opts.warnings?.push({
                    kind: "OVERWRITE_CORRUPT",
                    message: `Overwrote corrupt mode file for ${id}`,
                    ref: filePath,
                });
                continue;
            }
        }
        fs.writeFileSync(filePath, JSON.stringify(mode, null, 2), "utf-8");
    }
    const pack = {
        id: opts.packId,
        version: "1.0.0",
        name: "Num Pack (imported)",
        description: "Imported agents converted to Num Agents modes/flows.",
        modesDir: path.relative(opts.packOutDir, opts.outModesDir).replace(/\\/g, "/"),
    };
    written.push(packJsonPath);
    if (!opts.dryRun)
        fs.writeFileSync(packJsonPath, JSON.stringify(pack, null, 2), "utf-8");
    return { writtenFiles: written, packJsonPath };
}
function isStubMode(m) {
    const tags = Array.isArray(m?.tags) ? m.tags.map(String) : [];
    return tags.includes("stub") || tags.includes("alias") || m?.source === "generated";
}
