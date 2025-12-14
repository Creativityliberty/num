import fg from "fast-glob";
import yaml from "js-yaml";
import fs from "node:fs/promises";
import path from "node:path";

export type LoadedYamlFile = {
  absPath: string;
  relPath: string;
  doc: unknown;
};

export async function loadYamlFiles(opts: {
  modesPath: string;
  patterns?: string[];
}): Promise<LoadedYamlFile[]> {
  const base = path.resolve(opts.modesPath);
  const patterns = opts.patterns ?? ["**/*.yaml", "**/*.yml", "**/*.json"];

  const entries = await fg(patterns, {
    cwd: base,
    absolute: true,
    onlyFiles: true,
    followSymbolicLinks: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/package.json",
      "**/package-lock.json",
      "**/tsconfig.json",
      "**/.mcp/**",
      "**/.cursor/**",
      "**/.claude/**",
      "**/.windsurf/**",
    ],
  });

  const out: LoadedYamlFile[] = [];
  for (const absPath of entries) {
    try {
      const raw = await fs.readFile(absPath, "utf8");
      const doc = absPath.endsWith(".json") ? JSON.parse(raw) : yaml.load(raw);
      // Only include if it looks like a mode definition
      if (doc && typeof doc === "object" && ("id" in doc || "flow" in doc || "name" in doc)) {
        const relPath = path.relative(base, absPath);
        out.push({ absPath, relPath, doc });
      }
    } catch {
      // Skip files that fail to parse
    }
  }
  return out;
}
