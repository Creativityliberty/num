import fs from "node:fs/promises";
import path from "node:path";
function safeJoin(root, ...parts) {
    const absRoot = path.resolve(root);
    const p = path.resolve(absRoot, ...parts);
    if (!p.startsWith(absRoot))
        throw new Error("PATH_OUTSIDE_WORKSPACE");
    return p;
}
function replaysDir(workspaceRoot) {
    return safeJoin(workspaceRoot, ".mcp", "replays");
}
export async function listReplays(workspaceRoot) {
    const dir = replaysDir(workspaceRoot);
    let files = [];
    try {
        files = await fs.readdir(dir);
    }
    catch {
        return [];
    }
    const out = [];
    for (const f of files) {
        if (!f.endsWith(".json"))
            continue;
        const p = path.join(dir, f);
        try {
            const raw = await fs.readFile(p, "utf8");
            const json = JSON.parse(raw);
            out.push({
                runId: json.runId ?? path.basename(f, ".json"),
                ok: !!json.ok,
                updatedAt: (await fs.stat(p)).mtime.toISOString(),
            });
        }
        catch {
            // ignore
        }
    }
    out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return out;
}
export async function loadReplay(workspaceRoot, runId) {
    const p = safeJoin(workspaceRoot, ".mcp", "replays", `${runId}.json`);
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
}
export async function downloadReplayJSON(workspaceRoot, runId) {
    return await loadReplay(workspaceRoot, runId);
}
