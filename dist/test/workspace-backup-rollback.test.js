import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PolicySchema } from "../src/core/policy.js";
import { backupFiles, rollbackWorkspace } from "../src/server/workspace.js";
describe("workspace backup/rollback (11.3)", () => {
    it("backs up and restores a file", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-ws-"));
        const policy = PolicySchema.parse({
            workspaceRoot: tmp,
            allowWrite: true,
            allowedWritePaths: ["src/**", ".mcp/**"],
            blockedWritePaths: [".git/**", "node_modules/**"],
        });
        await fs.mkdir(path.join(tmp, "src"), { recursive: true });
        const file = path.join(tmp, "src", "a.txt");
        await fs.writeFile(file, "ORIGINAL", "utf8");
        const runId = "r-backup";
        const b = await backupFiles({
            workspaceRoot: tmp,
            policy,
            runId,
            files: ["src/a.txt"],
        });
        expect(b.ok).toBe(true);
        expect(b.files).toContain("src/a.txt");
        await fs.writeFile(file, "MODIFIED", "utf8");
        const rb = await rollbackWorkspace({ workspaceRoot: tmp, policy, runId });
        expect(rb.ok).toBe(true);
        expect(rb.restoredCount).toBe(1);
        const content = await fs.readFile(file, "utf8");
        expect(content).toBe("ORIGINAL");
    });
    it("denies rollback on blocked paths", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-ws-"));
        const policy = PolicySchema.parse({
            workspaceRoot: tmp,
            allowWrite: true,
            allowedWritePaths: ["src/**", ".mcp/**"],
            blockedWritePaths: [".git/**"],
        });
        const runId = "r-blocked";
        const base = path.join(tmp, ".mcp", "backups", runId, ".git");
        await fs.mkdir(base, { recursive: true });
        await fs.writeFile(path.join(base, "config"), "X", "utf8");
        await expect(rollbackWorkspace({ workspaceRoot: tmp, policy, runId })).rejects.toThrow(/Policy blocks rollback write/);
    });
    it("handles new files (no original to backup)", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-ws-"));
        const policy = PolicySchema.parse({
            workspaceRoot: tmp,
            allowWrite: true,
            allowedWritePaths: ["src/**", ".mcp/**"],
        });
        await fs.mkdir(path.join(tmp, "src"), { recursive: true });
        const runId = "r-new";
        const b = await backupFiles({
            workspaceRoot: tmp,
            policy,
            runId,
            files: ["src/new.txt"],
        });
        expect(b.ok).toBe(true);
        expect(b.files).toContain("src/new.txt");
    });
    it("throws on missing runId", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-ws-"));
        await expect(backupFiles({ workspaceRoot: tmp, runId: "", files: ["a.txt"] })).rejects.toThrow(/Missing runId/);
        await expect(rollbackWorkspace({ workspaceRoot: tmp, runId: "" })).rejects.toThrow(/Missing runId/);
    });
    it("throws on rollback when backup does not exist", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-ws-"));
        await expect(rollbackWorkspace({ workspaceRoot: tmp, runId: "nonexistent" })).rejects.toThrow();
    });
});
//# sourceMappingURL=workspace-backup-rollback.test.js.map