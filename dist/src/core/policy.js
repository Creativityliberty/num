import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
const ExecPolicySchema = z.object({
    allowedExecutables: z.array(z.string()).default([]),
    allowedArgs: z.record(z.array(z.array(z.string()))).default({}),
});
const ConfirmationTargetSchema = z.enum(["applyPatch", "exec", "branch", "commit"]);
export const PolicySchema = z.object({
    workspaceRoot: z.string().min(1),
    allowWrite: z.boolean().default(false),
    allowExec: z.boolean().default(false),
    allowGit: z.boolean().default(false),
    maxPatchBytes: z.number().int().min(1).default(2_000_000),
    maxFilesChanged: z.number().int().min(1).default(400),
    allowedCommands: z.array(z.string()).default([]),
    exec: ExecPolicySchema.default({ allowedExecutables: [], allowedArgs: {} }),
    allowedWritePaths: z.array(z.string()).default([]),
    blockedWritePaths: z.array(z.string()).default([".git/**", "node_modules/**"]),
    requireConfirmationFor: z.array(ConfirmationTargetSchema).default([]),
    /** Rollback cooldown (seconds). Used by dashboard to avoid spam/double-click. Default: 300s (5 min) */
    rollbackCooldownSeconds: z.number().int().min(0).max(24 * 3600).default(300),
    git: z
        .object({
        allowedBranchPrefixes: z.array(z.string()).default(["mcp/", "fix/", "feat/"]),
        allowCommit: z.boolean().default(false),
        commitMessagePattern: z.string().default("^.{5,120}$"),
        allowPush: z.boolean().default(false),
    })
        .default({}),
});
export async function loadPolicy(policyPath) {
    const abs = path.resolve(policyPath);
    const raw = await fs.readFile(abs, "utf8");
    const json = JSON.parse(raw);
    return PolicySchema.parse(json);
}
export function defaultPolicy() {
    return PolicySchema.parse({ workspaceRoot: process.cwd() });
}
/**
 * v11.1 allowlist check for exec.
 * Priority:
 *   1) policy.exec.allowedExecutables + policy.exec.allowedArgs (preferred)
 *   2) policy.allowedCommands (legacy fallback)
 */
export function isExecAllowed(policy, cmd, args) {
    const exec = policy.exec ?? { allowedExecutables: [], allowedArgs: {} };
    const allowedExecs = exec.allowedExecutables ?? [];
    const allowedArgs = exec.allowedArgs ?? {};
    // Preferred mode: allowedExecutables defined => enforce it
    if (allowedExecs.length > 0) {
        if (!allowedExecs.includes(cmd)) {
            return { ok: false, reason: `Executable not allowed: ${cmd}` };
        }
        const patterns = allowedArgs[cmd];
        if (patterns && patterns.length > 0) {
            const match = patterns.some((p) => sameArgs(p, args));
            if (!match)
                return { ok: false, reason: `Args not allowed for ${cmd}: ${args.join(" ")}` };
        }
        return { ok: true };
    }
    // Legacy fallback: allowedCommands exact match on "cmd arg1 arg2"
    const legacy = policy.allowedCommands ?? [];
    if (legacy.length > 0) {
        const full = [cmd, ...args].join(" ").trim();
        if (!legacy.includes(full))
            return { ok: false, reason: `Command not in allowedCommands: ${full}` };
        return { ok: true };
    }
    // No allowlist => deny by default
    return { ok: false, reason: "No exec allowlist configured (policy.exec.allowedExecutables or allowedCommands)" };
}
function sameArgs(pattern, args) {
    if (pattern.length !== args.length)
        return false;
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== args[i])
            return false;
    }
    return true;
}
/**
 * v11.2 - Check if confirmation is required for an action
 */
export function requiresConfirmation(policy, what) {
    return (policy.requireConfirmationFor ?? []).includes(what);
}
/**
 * v11.2 - Check if a file path is allowed for writing
 */
export function isWritePathAllowed(policy, filePath) {
    const p = normalizeRelPath(filePath);
    const blocked = policy.blockedWritePaths ?? [];
    if (blocked.some((g) => globMatch(g, p))) {
        return { ok: false, reason: `Write blocked by blockedWritePaths: ${p}` };
    }
    const allowed = policy.allowedWritePaths ?? [];
    if (allowed.length > 0) {
        if (!allowed.some((g) => globMatch(g, p))) {
            return { ok: false, reason: `Write not permitted by allowedWritePaths: ${p}` };
        }
    }
    return { ok: true };
}
function normalizeRelPath(p) {
    const cleaned = p.replace(/^[a-zA-Z]:[\\/]/, "").replaceAll("\\", "/").replace(/^\/+/, "");
    const norm = path.posix.normalize(cleaned);
    const safe = norm.replace(/^(\.\.\/)+/, "");
    return safe;
}
function globMatch(glob, input) {
    const g = glob.replaceAll("\\", "/").replace(/^\/+/, "");
    const re = globToRegExp(g);
    return re.test(input);
}
function globToRegExp(glob) {
    let s = "^";
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === "*") {
            const next = glob[i + 1];
            if (next === "*") {
                s += ".*";
                i++;
            }
            else {
                s += "[^/]*";
            }
            continue;
        }
        if (/[.+?^${}()|[\]\\]/.test(c))
            s += "\\" + c;
        else
            s += c;
    }
    s += "$";
    return new RegExp(s);
}
