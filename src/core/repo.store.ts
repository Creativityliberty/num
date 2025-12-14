import fs from "node:fs/promises";
import path from "node:path";
import { ModeSchema } from "./modes.schema.js";
import { PackSchema } from "./pack.schema.js";

export type RepoMode = {
  packId: string;
  packVersion?: string;
  packTags?: string[];
  mode: any;
};

export class RepoStore {
  constructor(private opts: { repoPath: string }) {}

  async load(): Promise<RepoMode[]> {
    const out: RepoMode[] = [];

    let entries: any[];
    try {
      entries = await fs.readdir(this.opts.repoPath, { withFileTypes: true });
    } catch {
      return out;
    }

    for (const d of entries.filter((e) => e.isDirectory())) {
      const base = path.join(this.opts.repoPath, d.name);
      const packPath = path.join(base, "pack.json");

      let pack: any;
      try {
        const packRaw = await fs.readFile(packPath, "utf-8");
        pack = PackSchema.parse(JSON.parse(packRaw));
      } catch {
        continue; // Skip directories without valid pack.json
      }

      if (!pack.enabled) continue;

      const modesDir = path.join(base, "modes");
      let files: string[];
      try {
        files = (await fs.readdir(modesDir)).filter((f) => f.endsWith(".json"));
      } catch {
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
        } catch {
          // Skip invalid mode files
        }
      }
    }

    return out;
  }
}
