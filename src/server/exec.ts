import { spawn } from "node:child_process";
import path from "node:path";
import { isExecAllowed, type Policy } from "../core/policy.js";

export type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  truncated: boolean;
  command: string;
};

// Blocked tokens — shell operators and dangerous executables
const BLOCKLIST_TOKENS = [
  "rm",
  "sudo",
  "bash",
  "sh",
  "zsh",
  "powershell",
  "pwsh",
  "curl",
  "wget",
  "eval",
  "exec",
];

// Shell operators that should never appear in args
const SHELL_OPERATORS = ["|", "&&", "||", ";", ">", ">>", "<", "<<", "`", "$(" ];

const MAX_OUTPUT_BYTES = 200 * 1024; // 200KB

function sanitizeCmd(cmd: string): string {
  if (/\s/.test(cmd)) throw new Error("Invalid cmd: whitespace not allowed");
  if (cmd.includes("/") || cmd.includes("\\"))
    throw new Error("Invalid cmd: path separators not allowed (use executable name)");
  return cmd;
}

function ensureInsideWorkspace(workspaceRoot: string, cwd?: string): string {
  const root = path.resolve(workspaceRoot);
  const c = path.resolve(cwd ? path.join(root, cwd) : root);
  if (!c.startsWith(root)) throw new Error("CWD_OUTSIDE_WORKSPACE");
  return c;
}

function isBlockedToken(cmd: string, args: string[]): { blocked: boolean; token?: string } {
  // Check cmd against blocklist
  if (BLOCKLIST_TOKENS.includes(cmd.toLowerCase())) {
    return { blocked: true, token: cmd };
  }
  // Check args for shell operators
  for (const arg of args) {
    for (const op of SHELL_OPERATORS) {
      if (arg.includes(op)) return { blocked: true, token: arg };
    }
  }
  return { blocked: false };
}

function redactSecrets(s: string): string {
  return s
    .replace(/(sk-[a-zA-Z0-9]{20,})/g, "sk-REDACTED")
    .replace(/(AKIA[0-9A-Z]{16})/g, "AKIA_REDACTED")
    .replace(/(ghp_[A-Za-z0-9]{20,})/g, "ghp_REDACTED")
    .replace(/(xox[baprs]-[A-Za-z0-9-]{10,})/g, "xox_REDACTED")
    .replace(/(glpat-[A-Za-z0-9_-]{20,})/g, "glpat_REDACTED");
}

export type RunCommandOptions = {
  cmd: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
  workspaceRoot: string;
};

export async function runCommand(opts: RunCommandOptions): Promise<ExecResult> {
  const cmd = sanitizeCmd(opts.cmd.trim());
  const args = (opts.args ?? []).map(String);
  const blocked = isBlockedToken(cmd, args);
  if (blocked.blocked) throw new Error(`Command blocked token: ${blocked.token}`);

  const timeoutMs = Math.min(Math.max(opts.timeoutMs ?? 60_000, 1000), 120_000);
  const cwd = ensureInsideWorkspace(opts.workspaceRoot, opts.cwd);
  const startTime = performance.now();
  const commandStr = [cmd, ...args].join(" ").trim();

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let truncated = false;
    let killed = false;

    const proc = spawn(cmd, args, {
      shell: false,
      cwd,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    const timeout = setTimeout(() => {
      killed = true;
      proc.kill("SIGTERM");
      setTimeout(() => proc.kill("SIGKILL"), 1000);
    }, timeoutMs);

    proc.stdout.on("data", (data: Buffer) => {
      const chunk = data.toString();
      if (stdout.length + chunk.length > MAX_OUTPUT_BYTES) {
        stdout += chunk.slice(0, MAX_OUTPUT_BYTES - stdout.length);
        truncated = true;
      } else {
        stdout += chunk;
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      const chunk = data.toString();
      if (stderr.length + chunk.length > MAX_OUTPUT_BYTES) {
        stderr += chunk.slice(0, MAX_OUTPUT_BYTES - stderr.length);
        truncated = true;
      } else {
        stderr += chunk;
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        exitCode: -1,
        stdout: redactSecrets(stdout),
        stderr: redactSecrets(`SPAWN_ERROR: ${err.message}`),
        durationMs: Math.round(performance.now() - startTime),
        truncated,
        command: commandStr,
      });
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        exitCode: killed ? -2 : (code ?? -1),
        stdout: redactSecrets(truncated ? stdout + "\n[OUTPUT TRUNCATED]" : stdout),
        stderr: redactSecrets(killed ? stderr + "\n[TIMEOUT]" : stderr),
        durationMs: Math.round(performance.now() - startTime),
        truncated,
        command: commandStr,
      });
    });
  });
}

export async function runCommandWithPolicy(
  policy: Policy,
  opts: { cmd: string; args?: string[]; cwd?: string; timeoutMs?: number }
): Promise<ExecResult> {
  const startTime = performance.now();
  const cmd = sanitizeCmd(opts.cmd.trim());
  const args = (opts.args ?? []).map(String);
  const commandStr = [cmd, ...args].join(" ").trim();

  if (!policy.allowExec) {
    return {
      exitCode: -1,
      stdout: "",
      stderr: "EXEC_DISABLED_BY_POLICY (allowExec=false)",
      durationMs: Math.round(performance.now() - startTime),
      truncated: false,
      command: commandStr,
    };
  }

  // Check blocked tokens BEFORE policy allowlist (security first)
  const blocked = isBlockedToken(cmd, args);
  if (blocked.blocked) {
    return {
      exitCode: -1,
      stdout: "",
      stderr: `BLOCKED_TOKEN: ${blocked.token}`,
      durationMs: Math.round(performance.now() - startTime),
      truncated: false,
      command: commandStr,
    };
  }

  const allow = isExecAllowed(policy, cmd, args);
  if (!allow.ok) {
    return {
      exitCode: -1,
      stdout: "",
      stderr: `POLICY_BLOCKS_EXEC: ${allow.reason}`,
      durationMs: Math.round(performance.now() - startTime),
      truncated: false,
      command: commandStr,
    };
  }

  // Check cwd is inside workspace
  try {
    ensureInsideWorkspace(policy.workspaceRoot, opts.cwd);
  } catch {
    return {
      exitCode: -1,
      stdout: "",
      stderr: "CWD_OUTSIDE_WORKSPACE",
      durationMs: Math.round(performance.now() - startTime),
      truncated: false,
      command: commandStr,
    };
  }

  return runCommand({
    workspaceRoot: policy.workspaceRoot,
    cmd,
    args,
    cwd: opts.cwd,
    timeoutMs: opts.timeoutMs,
  });
}

// Legacy compatibility: parse "npm test" string into cmd/args
export function parseCommandString(command: string): { cmd: string; args: string[] } {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0] ?? "";
  const args = parts.slice(1);
  return { cmd, args };
}

// Legacy function for backward compatibility with old tests
export function isCommandAllowed(command: string, customAllowlist?: RegExp[]): boolean {
  const cmd = command.trim();
  const blocklist = [/rm\s+-rf/, /sudo/, /chmod\s+777/, /curl.*\|.*sh/, /wget.*\|.*sh/];
  for (const pattern of blocklist) {
    if (pattern.test(cmd)) return false;
  }
  const defaultAllowlist = [
    /^npm (test|run (lint|build|typecheck|format|ci))$/,
    /^npx (vitest|jest|eslint|prettier|tsc)( .+)?$/,
    /^pnpm (test|run (lint|build|typecheck|format|ci))$/,
    /^yarn (test|run (lint|build|typecheck|format|ci))$/,
    /^pytest( .+)?$/,
    /^python -m pytest( .+)?$/,
    /^go test( .+)?$/,
    /^cargo test( .+)?$/,
  ];
  const allowlist = customAllowlist ?? defaultAllowlist;
  return allowlist.some((pattern) => pattern.test(cmd));
}
