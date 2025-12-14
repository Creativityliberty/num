import fs from "node:fs/promises";
import path from "node:path";
import { ModeSchema } from "./modes.schema.js";
import { PackSchema } from "./pack.schema.js";
export class RepoStore {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    async load() {
        const out = [];
        let entries;
        try {
            entries = await fs.readdir(this.opts.repoPath, { withFileTypes: true });
        }
        catch {
            return out;
        }
        for (const d of entries.filter((e) => e.isDirectory())) {
            const base = path.join(this.opts.repoPath, d.name);
            const packPath = path.join(base, "pack.json");
            let pack;
            try {
                const packRaw = await fs.readFile(packPath, "utf-8");
                pack = PackSchema.parse(JSON.parse(packRaw));
            }
            catch {
                continue; // Skip directories without valid pack.json
            }
            if (!pack.enabled)
                continue;
            const modesDir = path.join(base, "modes");
            let files;
            try {
                files = (await fs.readdir(modesDir)).filter((f) => f.endsWith(".json"));
            }
            catch {
                continue; // Skip packs without modes directory
            }
            for (const f of files) {
                try {
                    const raw = await fs.readFile(path.join(modesDir, f), "utf-8");
                    const mode = ModeSchema.parse(JSON.parse(raw));
                    out.push({
                        packId: pack.id,
                        packVersion: pack.version,
                        packTags: pack.tags,
                        mode,
                    });
                }
                catch {
                    // Skip invalid mode files
                }
            }
        }
        return out;
    }
}
