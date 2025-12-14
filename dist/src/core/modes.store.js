import fs from "node:fs/promises";
import path from "node:path";
import { ModeSchema } from "./modes.schema.js";
export class ModesStore {
    opts;
    constructor(opts) {
        this.opts = opts;
    }
    modeFile(id) {
        return path.join(this.opts.modesPath, `${id}.json`);
    }
    async get(id) {
        const p = this.modeFile(id);
        const raw = await fs.readFile(p, "utf-8");
        const json = JSON.parse(raw);
        return ModeSchema.parse(json);
    }
}
