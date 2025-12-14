import crypto from "node:crypto";
import { writeReport } from "./reports.js";

type PackOpsModeRow = {
  id: string;
  validate: { ok: boolean; error?: string; code?: string };
  simulate: { ok: boolean; ticks?: number; parallelGroups?: number; error?: string; code?: string };
};

export type PackOpsReport = {
  ok: boolean;
  ts: string;
  reportId: string;
  packId: string;
  imported?: {
    ok: boolean;
    importedCount: number;
    warnings: unknown[];
    writtenFiles: string[];
    packJsonPath?: string;
  };
  stats: {
    total: number;
    valid: number;
    invalid: number;
    simulated: number;
    simulateFailed: number;
    topErrors: Record<string, number>;
    topSimErrors: Record<string, number>;
  };
  modes: PackOpsModeRow[];
};

function inc(obj: Record<string, number>, k: string) {
  obj[k] = (obj[k] ?? 0) + 1;
}

export async function runPackOps(opts: {
  root: string;
  packId: string;
  modeIds: string[];
  validateOne: (id: string) => Promise<unknown>;
  simulateOne: (id: string) => Promise<unknown>;
  importResult?: unknown;
}) {
  const ts = new Date().toISOString();
  const reportId = `${ts.replace(/[:.]/g, "-")}-${opts.packId}-${crypto.randomBytes(3).toString("hex")}`;
  const topErrors: Record<string, number> = {};
  const topSimErrors: Record<string, number> = {};

  const rows: PackOpsModeRow[] = [];
  let valid = 0;
  let invalid = 0;
  let simulated = 0;
  let simulateFailed = 0;

  for (const id of opts.modeIds) {
    let v: { ok: boolean; error?: string; code?: string } = { ok: true };
    let s: { ok: boolean; ticks?: number; parallelGroups?: number; error?: string; code?: string } = { ok: true };

    try {
      const vr = await opts.validateOne(id);
      v = normalizeValidate(vr);
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      v = { ok: false, error: String(err?.message ?? e), code: err?.code };
    }

    if (v.ok) valid++;
    else {
      invalid++;
      inc(topErrors, v.code ?? "INVALID");
    }

    try {
      const sr = await opts.simulateOne(id);
      s = normalizeSimulate(sr);
      simulated++;
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      s = { ok: false, error: String(err?.message ?? e), code: err?.code };
      simulateFailed++;
      inc(topSimErrors, s.code ?? "SIMULATE_FAILED");
    }

    rows.push({ id, validate: v, simulate: s });
  }

  const importResult = opts.importResult as Record<string, unknown> | undefined;
  const report: PackOpsReport = {
    ok: true,
    ts,
    reportId,
    packId: opts.packId,
    imported: importResult
      ? {
          ok: !!importResult.ok,
          importedCount: (importResult.importedCount as number) ?? 0,
          warnings: (importResult.warnings as unknown[]) ?? [],
          writtenFiles: (importResult.writtenFiles as string[]) ?? [],
          packJsonPath: importResult.packJsonPath as string | undefined,
        }
      : undefined,
    stats: {
      total: opts.modeIds.length,
      valid,
      invalid,
      simulated,
      simulateFailed,
      topErrors,
      topSimErrors,
    },
    modes: rows,
  };

  const file = writeReport(opts.root, "packops", reportId, report);
  return { reportId, file, report };
}

function normalizeValidate(vr: unknown): { ok: boolean; error?: string; code?: string } {
  const v = vr as Record<string, unknown> | null;
  if (v?.ok === true) return { ok: true };
  const code = String(v?.code ?? v?.kind ?? "INVALID");
  const error = String(v?.error ?? v?.message ?? "Invalid mode");
  return { ok: false, code, error };
}

function normalizeSimulate(sr: unknown): { ok: boolean; ticks?: number; parallelGroups?: number; error?: string; code?: string } {
  const s = sr as Record<string, unknown> | null;
  if (s?.ok === false) {
    return { ok: false, code: String(s?.code ?? "SIMULATE_FAILED"), error: String(s?.error ?? s?.message) };
  }
  const result = s?.result as Record<string, unknown> | undefined;
  return {
    ok: true,
    ticks: (s?.ticks ?? result?.ticks) as number | undefined,
    parallelGroups: ((s?.parallelGroups as unknown[])?.length ?? (result?.parallelGroups as unknown[])?.length) as number | undefined,
  };
}
