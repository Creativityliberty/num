import fs from "node:fs";
import path from "node:path";

export type ReportKind = "packops" | "smoke";

export function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function reportsDir(root: string, kind: ReportKind) {
  return path.join(root, ".mcp", "reports", kind);
}

export function writeReport(root: string, kind: ReportKind, id: string, payload: unknown) {
  const dir = reportsDir(root, kind);
  ensureDir(dir);
  const file = path.join(dir, `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf-8");
  return file;
}

export function listReports(root: string, kind: ReportKind) {
  const dir = reportsDir(root, kind);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();
  return files.map((f) => ({ id: f.replace(/\.json$/, ""), file: path.join(dir, f) }));
}

export function loadReport(root: string, kind: ReportKind, id: string) {
  const dir = reportsDir(root, kind);
  const file = path.join(dir, `${id}.json`);
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw);
}
