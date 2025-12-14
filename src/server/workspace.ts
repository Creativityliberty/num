import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { parsePatchStats, validatePatchSafety } from "../core/patch.js";
import { isWritePathAllowed, type Policy } from "../core/policy.js";

function safeJoin(root: string, ...parts: string[]): string {
  const absRoot = path.resolve(root);
  const p = path.resolve(absRoot, ...parts);
  if (!p.startsWith(absRoot)) throw new Error("PATH_OUTSIDE_WORKSPACE");
  return p;
}

function normalizePatchPath(p: string): string {
  return String(p ?? "").replace(/^a\//, "").replace(/^b\//, "").replaceAll("\\", "/").replace(/^\/+/, "");
}

export type BackupResult = {
  ok: boolean;
  backupPath: string;
  files: string[];
};

export async function backupFiles(opts: {
  workspaceRoot: string;
  policy?: Policy;
  runId: string;
  files: string[];
}): Promise<BackupResult> {
  const runId = String(opts.runId || "").trim();
  if (!runId) throw new Error("Missing runId");

  if (opts.policy) {
    if (!opts.policy.allowWrite) throw new Error("Policy forbids write (allowWrite=false)");
  }

  const base = safeJoin(opts.workspaceRoot, ".mcp", "backups", runId);
  await fsPromises.mkdir(base, { recursive: true });

  const backedUp: string[] = [];
  for (const f of opts.files) {
    const rel = normalizePatchPath(f);
    if (!rel) continue;

    if (opts.policy) {
      const allow = isWritePathAllowed(opts.policy, rel);
      if (!allow.ok) throw new Error(`Policy blocks backup write: ${allow.reason}`);
    }

    const src = safeJoin(opts.workspaceRoot, rel);
    const dst = safeJoin(base, rel);
    await fsPromises.mkdir(path.dirname(dst), { recursive: true });
    try {
      const data = await fsPromises.readFile(src);
      await fsPromises.writeFile(dst, data);
      backedUp.push(rel);
    } catch {
      backedUp.push(rel);
    }
  }

  return { ok: true, backupPath: base, files: backedUp };
}

export type RollbackResult = {
  ok: boolean;
  restoredCount: number;
  restored: string[];
};

export async function rollbackWorkspace(opts: {
  workspaceRoot: string;
  policy?: Policy;
  runId: string;
}): Promise<RollbackResult> {
  const runId = String(opts.runId || "").trim();
  if (!runId) throw new Error("Missing runId");

  if (opts.policy) {
    if (!opts.policy.allowWrite) throw new Error("Policy forbids write (allowWrite=false)");
  }

  const base = safeJoin(opts.workspaceRoot, ".mcp", "backups", runId);
  await fsPromises.access(base);

  const restored: string[] = [];

  async function walk(dir: string) {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else {
        const rel = path.relative(base, p).replaceAll("\\", "/");
        if (!rel) continue;

        if (opts.policy) {
          const allow = isWritePathAllowed(opts.policy, rel);
          if (!allow.ok) throw new Error(`Policy blocks rollback write: ${allow.reason}`);
        }

        const dst = safeJoin(opts.workspaceRoot, rel);
        await fsPromises.mkdir(path.dirname(dst), { recursive: true });
        const data = await fsPromises.readFile(p);
        await fsPromises.writeFile(dst, data);
        restored.push(rel);
      }
    }
  }

  await walk(base);
  return { ok: true, restoredCount: restored.length, restored };
}

export type ApplyPatchResult = {
  applied: boolean;
  dryRun: boolean;
  filesChanged: number;
  insertions: number;
  deletions: number;
  errors: string[];
};

export type ApplyPatchOptions = {
  workspaceRoot: string;
  diff: string;
  dryRun: boolean;
  policy?: Policy;
};

export function applyUnifiedPatch(
  workspaceRootOrOpts: string | ApplyPatchOptions,
  diff?: string,
  dryRun?: boolean
): ApplyPatchResult {
  // Support both old signature and new options object
  let workspaceRoot: string;
  let patchDiff: string;
  let isDryRun: boolean;
  let policy: Policy | undefined;

  if (typeof workspaceRootOrOpts === "string") {
    workspaceRoot = workspaceRootOrOpts;
    patchDiff = diff ?? "";
    isDryRun = dryRun ?? false;
  } else {
    workspaceRoot = workspaceRootOrOpts.workspaceRoot;
    patchDiff = workspaceRootOrOpts.diff;
    isDryRun = workspaceRootOrOpts.dryRun;
    policy = workspaceRootOrOpts.policy;
  }

  const errors: string[] = [];

  // Validate workspace root exists
  if (!fs.existsSync(workspaceRoot)) {
    return {
      applied: false,
      dryRun: isDryRun,
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      errors: [`Workspace root does not exist: ${workspaceRoot}`],
    };
  }

  // Validate patch safety
  const safety = validatePatchSafety(patchDiff, workspaceRoot);
  if (!safety.safe) {
    return {
      applied: false,
      dryRun: isDryRun,
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      errors: safety.errors,
    };
  }

  // Parse patch stats
  const stats = parsePatchStats(patchDiff);
  if (!stats.valid) {
    return {
      applied: false,
      dryRun: isDryRun,
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      errors: stats.errors,
    };
  }

  // Verify all files are within workspace
  for (const file of stats.files) {
    const absPath = path.resolve(workspaceRoot, file);
    if (!absPath.startsWith(path.resolve(workspaceRoot))) {
      errors.push(`File escapes workspace: ${file}`);
    }
  }

  // v11.2: Policy write-scope enforcement
  if (policy) {
    if (!policy.allowWrite) {
      return {
        applied: false,
        dryRun: isDryRun,
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
        errors: ["Policy forbids write (allowWrite=false)"],
      };
    }
    for (const file of stats.files) {
      const rel = file.replace(/^a\//, "").replace(/^b\//, "");
      const allow = isWritePathAllowed(policy, rel);
      if (!allow.ok) {
        errors.push(`Policy blocks patch write: ${allow.reason}`);
      }
    }
  }

  if (errors.length > 0) {
    return {
      applied: false,
      dryRun: isDryRun,
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      errors,
    };
  }

  if (isDryRun) {
    return {
      applied: false,
      dryRun: true,
      filesChanged: stats.filesChanged,
      insertions: stats.insertions,
      deletions: stats.deletions,
      errors: [],
    };
  }

  // NOTE: Actual patch application would require a proper diff library
  // For now, we return a "not implemented" error for non-dry-run
  // In production, you'd use something like 'diff' npm package or shell out to 'git apply'
  return {
    applied: false,
    dryRun: false,
    filesChanged: stats.filesChanged,
    insertions: stats.insertions,
    deletions: stats.deletions,
    errors: ["Actual patch application not yet implemented — use dryRun=true for validation, or apply via git apply"],
  };
}
