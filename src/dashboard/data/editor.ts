import fs from "node:fs";
import path from "node:path";
import { ModesRegistry } from "../../core/modes.registry.js";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function safeSlug(s: string) {
  const x = (s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!x) throw new Error("Invalid slug");
  return x;
}

export function defaultModeTemplate(modeId: string, name?: string) {
  return {
    id: modeId,
    name: name || modeId,
    tags: ["custom"],
    flow: {
      version: "1",
      nodes: [
        {
          id: "do",
          role: "implementer",
          goal: "Do the task",
          expectedSchema: "patchCandidate",
          prompt: {
            system: "You are a helpful dev agent. Produce a valid patchCandidate JSON.",
            user: "Task: {{goal}}",
          },
        },
      ],
      edges: [],
    },
  };
}

export function modePathFromId(root: string, modeId: string, outModesDir: string) {
  const rel = outModesDir.replace(/^\.\//, "");
  const base = path.join(root, rel);
  const slug = modeId.includes(":") ? modeId.split(":")[1] : modeId;
  return path.join(base, `${slug}.json`);
}

export function openMode(registry: ModesRegistry, modeId: string) {
  const m = registry.get(modeId);
  if (!m) return null;
  return m;
}

export function writeMode(root: string, outModesDir: string, modeId: string, modeObj: any) {
  const p = modePathFromId(root, modeId, outModesDir);
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(modeObj, null, 2), "utf-8");
  return { path: p };
}

export function createMode(root: string, outModesDir: string, slug: string, name?: string) {
  const s = safeSlug(slug);
  const modeId = `num:${s}`;
  const p = modePathFromId(root, modeId, outModesDir);
  if (fs.existsSync(p)) throw new Error(`Mode already exists: ${p}`);
  ensureDir(path.dirname(p));
  const modeObj = defaultModeTemplate(modeId, name || s);
  fs.writeFileSync(p, JSON.stringify(modeObj, null, 2), "utf-8");
  return { modeId, path: p, mode: modeObj };
}

export function duplicateMode(root: string, outModesDir: string, fromMode: any, slug: string, name?: string) {
  const s = safeSlug(slug);
  const modeId = `num:${s}`;
  const p = modePathFromId(root, modeId, outModesDir);
  if (fs.existsSync(p)) throw new Error(`Mode already exists: ${p}`);
  const copy = JSON.parse(JSON.stringify(fromMode));
  copy.id = modeId;
  if (name) copy.name = name;
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(copy, null, 2), "utf-8");
  return { modeId, path: p, mode: copy };
}
