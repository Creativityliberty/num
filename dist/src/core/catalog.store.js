import fs from "node:fs/promises";
import path from "node:path";
import { CatalogSchema } from "./catalog.schema.js";
export class CatalogStore {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    async load() {
        const raw = await fs.readFile(this.opts.catalogPath, "utf-8");
        const ext = path.extname(this.opts.catalogPath).toLowerCase();
        let data;
        if (ext === ".yaml" || ext === ".yml") {
            // Dynamic import for yaml (optional dependency)
            try {
                const yaml = await import("yaml");
                data = (yaml).parse(raw);
            }
            catch {
                throw new Error("YAML parsing requires 'yaml' package. Install with: npm install yaml");
            }
        }
        else {
            data = JSON.parse(raw);
        }
        return CatalogSchema.parse(data);
    }
}
