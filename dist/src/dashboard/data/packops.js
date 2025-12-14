import crypto from "node:crypto";
import { writeReport } from "./reports.js";
function inc(obj, k) {
    obj[k] = (obj[k] ?? 0) + 1;
}
export async function runPackOps(opts) {
    const ts = new Date().toISOString();
    const reportId = `${ts.replace(/[:.]/g, "-")}-${opts.packId}-${crypto.randomBytes(3).toString("hex")}`;
    const topErrors = {};
    const topSimErrors = {};
    const rows = [];
    let valid = 0;
    let invalid = 0;
    let simulated = 0;
    let simulateFailed = 0;
    for (const id of opts.modeIds) {
        let v = { ok: true };
        let s = { ok: true };
        try {
            const vr = await opts.validateOne(id);
            v = normalizeValidate(vr);
        }
        catch (e) {
            const err = e;
            v = { ok: false, error: String(err?.message ?? e), code: err?.code };
        }
        if (v.ok)
            valid++;
        else {
            invalid++;
            inc(topErrors, v.code ?? "INVALID");
        }
        try {
            const sr = await opts.simulateOne(id);
            s = normalizeSimulate(sr);
            simulated++;
        }
        catch (e) {
            const err = e;
            s = { ok: false, error: String(err?.message ?? e), code: err?.code };
            simulateFailed++;
            inc(topSimErrors, s.code ?? "SIMULATE_FAILED");
        }
        rows.push({ id, validate: v, simulate: s });
    }
    const importResult = opts.importResult;
    const report = {
        ok: true,
        ts,
        reportId,
        packId: opts.packId,
        imported: importResult
            ? {
                ok: !!importResult.ok,
                importedCount: importResult.importedCount ?? 0,
                warnings: importResult.warnings ?? [],
                writtenFiles: importResult.writtenFiles ?? [],
                packJsonPath: importResult.packJsonPath,
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
function normalizeValidate(vr) {
    const v = vr;
    if (v?.ok === true)
        return { ok: true };
    const code = String(v?.code ?? v?.kind ?? "INVALID");
    const error = String(v?.error ?? v?.message ?? "Invalid mode");
    return { ok: false, code, error };
}
function normalizeSimulate(sr) {
    const s = sr;
    if (s?.ok === false) {
        return { ok: false, code: String(s?.code ?? "SIMULATE_FAILED"), error: String(s?.error ?? s?.message) };
    }
    const result = s?.result;
    return {
        ok: true,
        ticks: (s?.ticks ?? result?.ticks),
        parallelGroups: (s?.parallelGroups?.length ?? result?.parallelGroups?.length),
    };
}
