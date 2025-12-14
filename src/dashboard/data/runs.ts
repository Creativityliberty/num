import fs from "node:fs/promises";
import path from "node:path";
import { OrchestrateRunRecordSchema } from "../../core/schemas.js";

function safeJoin(root: string, ...parts: string[]) {
  const absRoot = path.resolve(root);
  const p = path.resolve(absRoot, ...parts);
  if (!p.startsWith(absRoot)) throw new Error("PATH_OUTSIDE_WORKSPACE");
  return p;
}

function runsDir(workspaceRoot: string) {
  return safeJoin(workspaceRoot, ".mcp", "runs");
}

function bundlesDir(workspaceRoot: string) {
  return safeJoin(workspaceRoot, ".mcp", "bundles");
}

export async function hasBackup(workspaceRoot: string, runId: string): Promise<boolean> {
  const p = safeJoin(workspaceRoot, ".mcp", "backups", runId);
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

export async function saveRun(workspaceRoot: string, run: unknown) {
  const parsed = OrchestrateRunRecordSchema.parse(run);
  const dir = runsDir(workspaceRoot);
  await fs.mkdir(dir, { recursive: true });
  const p = safeJoin(workspaceRoot, ".mcp", "runs", `${parsed.runId}.json`);
  const tmp = p + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(parsed, null, 2), "utf8");
  await fs.rename(tmp, p);
  return parsed;
}

export async function listRuns(workspaceRoot: string) {
  const dir = runsDir(workspaceRoot);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const out: Array<{
    runId: string;
    sessionId: string;
    state: string;
    modeId: string | null;
    updatedAt: string;
    createdAt: string;
  }> = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(dir, f), "utf8");
      const json = JSON.parse(raw) as unknown;
      const run = OrchestrateRunRecordSchema.parse(json);
      out.push({
        runId: run.runId,
        sessionId: run.sessionId,
        state: run.state,
        modeId: run.selectedMode?.id ?? null,
        updatedAt: run.updatedAt,
        createdAt: run.createdAt,
      });
    } catch {
      // ignore broken run files
    }
  }
  out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return out;
}

export async function loadRun(workspaceRoot: string, runId: string) {
  const p = safeJoin(workspaceRoot, ".mcp", "runs", `${runId}.json`);
  const raw = await fs.readFile(p, "utf8");
  const json = JSON.parse(raw) as unknown;
  return OrchestrateRunRecordSchema.parse(json);
}

export async function exportRunJSON(workspaceRoot: string, runId: string) {
  const run = await loadRun(workspaceRoot, runId);
  let bundle: unknown = null;
  try {
    bundle = await loadBundleForSession(workspaceRoot, run.sessionId);
  } catch {
    bundle = null;
  }
  return { run, bundle };
}

export async function listBundlesForSession(workspaceRoot: string, sessionId: string) {
  const dir = bundlesDir(workspaceRoot);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  return files.filter((f) => f.includes(sessionId) && f.endsWith(".json"));
}

export async function loadBundleForSession(workspaceRoot: string, sessionId: string) {
  const p = safeJoin(workspaceRoot, ".mcp", "bundles", `${sessionId}.json`);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as unknown;
}

export async function importRunJSON(workspaceRoot: string, runJson: unknown) {
  const run = OrchestrateRunRecordSchema.parse(runJson);
  const dir = safeJoin(workspaceRoot, ".mcp", "runs");
  await fs.mkdir(dir, { recursive: true });

  let file = path.join(dir, `${run.runId}.json`);
  let n = 1;
  while (true) {
    try {
      await fs.access(file);
      file = path.join(dir, `${run.runId}-imported-${n}.json`);
      n++;
    } catch {
      break;
    }
  }

  await fs.writeFile(file, JSON.stringify(run, null, 2), "utf8");
  const outRunId = path.basename(file, ".json");
  return { ok: true, runId: outRunId, path: file };
}
