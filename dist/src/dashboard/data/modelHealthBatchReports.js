import fs from "node:fs";
import path from "node:path";
export function listModelHealthBatchReports(root) {
    const dir = path.join(root, ".mcp", "reports", "model-health-batch");
    if (!fs.existsSync(dir))
        return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().reverse();
    return files.map((f) => ({ id: f.replace(/\.json$/, ""), path: path.join(dir, f) }));
}
export function loadModelHealthBatchReport(root, id) {
    const p = path.join(root, ".mcp", "reports", "model-health-batch", `${id}.json`);
    if (!fs.existsSync(p))
        return null;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
}
