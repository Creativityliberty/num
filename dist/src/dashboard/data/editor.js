import fs from "node:fs";
import path from "node:path";
function ensureDir(p) {
    if (!fs.existsSync(p))
        fs.mkdirSync(p, { recursive: true });
}
function safeSlug(s) {
    const x = (s || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    if (!x)
        throw new Error("Invalid slug");
    return x;
}
export function defaultModeTemplate(modeId, name) {
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
export function modePathFromId(root, modeId, outModesDir) {
    const rel = outModesDir.replace(/^\.\//, "");
    const base = path.join(root, rel);
    const slug = modeId.includes(":") ? modeId.split(":")[1] : modeId;
    return path.join(base, `${slug}.json`);
}
export function openMode(registry, modeId) {
    const m = registry.get(modeId);
    if (!m)
        return null;
    return m;
}
export function writeMode(root, outModesDir, modeId, modeObj) {
    const p = modePathFromId(root, modeId, outModesDir);
    ensureDir(path.dirname(p));
    fs.writeFileSync(p, JSON.stringify(modeObj, null, 2), "utf-8");
    return { path: p };
}
export function createMode(root, outModesDir, slug, name) {
    const s = safeSlug(slug);
    const modeId = `num:${s}`;
    const p = modePathFromId(root, modeId, outModesDir);
    if (fs.existsSync(p))
        throw new Error(`Mode already exists: ${p}`);
    ensureDir(path.dirname(p));
    const modeObj = defaultModeTemplate(modeId, name || s);
    fs.writeFileSync(p, JSON.stringify(modeObj, null, 2), "utf-8");
    return { modeId, path: p, mode: modeObj };
}
export function duplicateMode(root, outModesDir, fromMode, slug, name) {
    const s = safeSlug(slug);
    const modeId = `num:${s}`;
    const p = modePathFromId(root, modeId, outModesDir);
    if (fs.existsSync(p))
        throw new Error(`Mode already exists: ${p}`);
    const copy = JSON.parse(JSON.stringify(fromMode));
    copy.id = modeId;
    if (name)
        copy.name = name;
    ensureDir(path.dirname(p));
    fs.writeFileSync(p, JSON.stringify(copy, null, 2), "utf-8");
    return { modeId, path: p, mode: copy };
}
