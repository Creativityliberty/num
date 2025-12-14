import fs from "node:fs/promises";
import path from "node:path";
import { ModeSchema, type Mode } from "./modes.schema.js";

export class ModesStore {
  constructor(private opts: { modesPath: string }) {}

  private modeFile(id: string) {
    return path.join(this.opts.modesPath, `${id}.json`);
  }

  async get(id: string): Promise<Mode> {
    const p = this.modeFile(id);
    const raw = await fs.readFile(p, "utf-8");
    const json = JSON.parse(raw);
    return ModeSchema.parse(json);
  }
}
