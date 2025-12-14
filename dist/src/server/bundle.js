import fs from "node:fs/promises";
import path from "node:path";
export async function writeBundle(policy, sessionId, bundle) {
    const root = path.resolve(policy.workspaceRoot);
    const dir = path.join(root, ".mcp", "bundles");
    await fs.mkdir(dir, { recursive: true });
    const p = path.join(dir, `${sessionId}.json`);
    await fs.writeFile(p, JSON.stringify(bundle, null, 2), "utf8");
    return p;
}
