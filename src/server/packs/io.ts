import fs from "node:fs/promises";
import path from "node:path";
import { PackBundleSchema } from "../../core/pack.bundle.schema.js";
import { PackSchema } from "../../core/pack.schema.js";
import { downloadToString, sha256 } from "./download.js";

async function readAllFiles(dir: string): Promise<{ path: string; content: string }[]> {
  const out: { path: string; content: string }[] = [];

  const walk = async (base: string) => {
    const entries = await fs.readdir(base, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(base, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.isFile()) {
        const rel = path.relative(dir, p).replaceAll("\\", "/");
        const content = await fs.readFile(p, "utf-8");
        out.push({ path: rel, content });
      }
    }
  };

  await walk(dir);
  return out;
}

export async function exportPack(opts: {
  repoPath: string;
  packDirName: string;
  outDir: string;
}): Promise<{ outPath: string }> {
  const packDir = path.join(opts.repoPath, opts.packDirName);
  const packJson = JSON.parse(await fs.readFile(path.join(packDir, "pack.json"), "utf-8"));
  const pack = PackSchema.parse(packJson);
  const files = await readAllFiles(packDir);
  const bundle = PackBundleSchema.parse({ pack, files });

  await fs.mkdir(opts.outDir, { recursive: true });
  const ver = pack.version ?? "0.0.0";
  const outPath = path.join(opts.outDir, `${pack.id}@${ver}.json`);
  await fs.writeFile(outPath, JSON.stringify(bundle, null, 2), "utf-8");

  return { outPath };
}

export async function importPack(opts: {
  bundlePath: string;
  repoPath: string;
  allowOverwrite?: boolean;
}): Promise<{ ok: boolean; packId?: string; version?: string; targetDir?: string; message?: string }> {
  const raw = JSON.parse(await fs.readFile(opts.bundlePath, "utf-8"));
  const bundle = PackBundleSchema.parse(raw);
  const ver = bundle.pack.version ?? "0.0.0";
  const targetDir = path.join(opts.repoPath, bundle.pack.id);

  // Check for existing pack
  try {
    await fs.access(targetDir);
    if (!opts.allowOverwrite) {
      return { ok: false, message: `Pack dir exists: ${targetDir} (set allowOverwrite=true)` };
    }
  } catch {
    // Not exists, OK to proceed
  }

  await fs.mkdir(targetDir, { recursive: true });

  // Write all files from bundle
  for (const f of bundle.files) {
    const p = path.join(targetDir, f.path);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, f.content, "utf-8");
  }

  return { ok: true, packId: bundle.pack.id, version: ver, targetDir };
}

export async function importPackFromUrl(opts: {
  url: string;
  sha256?: string;
  repoPath: string;
  allowOverwrite?: boolean;
}): Promise<{ ok: boolean; packId?: string; version?: string; targetDir?: string; message?: string; expected?: string; got?: string }> {
  const raw = await downloadToString(opts.url);

  if (opts.sha256) {
    const got = sha256(raw);
    if (got.toLowerCase() !== opts.sha256.toLowerCase()) {
      return { ok: false, message: "SHA256 mismatch", expected: opts.sha256, got };
    }
  }

  const tmp = path.join(opts.repoPath, ".tmp-pack.bundle.json");
  await fs.mkdir(opts.repoPath, { recursive: true });
  await fs.writeFile(tmp, raw, "utf-8");

  try {
    const res = await importPack({ bundlePath: tmp, repoPath: opts.repoPath, allowOverwrite: opts.allowOverwrite });
    return res;
  } finally {
    await fs.unlink(tmp).catch(() => {});
  }
}
