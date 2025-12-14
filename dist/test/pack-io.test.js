import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { exportPack, importPack } from "../src/server/packs/io.js";
describe("13.2 pack export/import", () => {
    it("exports a pack to a bundle JSON", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-pack-"));
        const repo = path.join(tmp, "repo");
        const outDir = path.join(tmp, ".mcp", "packs");
        // Create pack structure
        await fs.mkdir(path.join(repo, "roo", "modes"), { recursive: true });
        await fs.writeFile(path.join(repo, "roo", "pack.json"), JSON.stringify({ id: "roo", version: "1.0.0", name: "Roo Pack" }, null, 2));
        await fs.writeFile(path.join(repo, "roo", "modes", "fix.json"), JSON.stringify({ id: "fix", name: "Fix Mode" }, null, 2));
        const result = await exportPack({ repoPath: repo, packDirName: "roo", outDir });
        expect(result.outPath).toContain("roo@1.0.0.json");
        // Verify bundle content
        const bundle = JSON.parse(await fs.readFile(result.outPath, "utf-8"));
        expect(bundle.format).toBe("mcp-agents-pack");
        expect(bundle.pack.id).toBe("roo");
        expect(bundle.pack.version).toBe("1.0.0");
        expect(bundle.files.length).toBeGreaterThan(0);
        expect(bundle.files.some((f) => f.path === "pack.json")).toBe(true);
        expect(bundle.files.some((f) => f.path === "modes/fix.json")).toBe(true);
    });
    it("imports a pack bundle into repo", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-pack-"));
        const repo = path.join(tmp, "repo");
        const outDir = path.join(tmp, ".mcp", "packs");
        // Create and export pack
        await fs.mkdir(path.join(repo, "test-pack", "modes"), { recursive: true });
        await fs.writeFile(path.join(repo, "test-pack", "pack.json"), JSON.stringify({ id: "test-pack", version: "2.0.0" }, null, 2));
        await fs.writeFile(path.join(repo, "test-pack", "modes", "a.json"), JSON.stringify({ id: "a" }, null, 2));
        const exported = await exportPack({ repoPath: repo, packDirName: "test-pack", outDir });
        // Import into new repo
        const repo2 = path.join(tmp, "repo2");
        await fs.mkdir(repo2, { recursive: true });
        const imported = await importPack({ bundlePath: exported.outPath, repoPath: repo2 });
        expect(imported.ok).toBe(true);
        expect(imported.packId).toBe("test-pack");
        expect(imported.version).toBe("2.0.0");
        // Verify files were written
        const packJson = await fs.readFile(path.join(repo2, "test-pack", "pack.json"), "utf-8");
        expect(packJson).toContain('"id": "test-pack"');
        const modeJson = await fs.readFile(path.join(repo2, "test-pack", "modes", "a.json"), "utf-8");
        expect(modeJson).toContain('"id": "a"');
    });
    it("rejects import if pack exists and allowOverwrite=false", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-pack-"));
        const repo = path.join(tmp, "repo");
        const outDir = path.join(tmp, ".mcp", "packs");
        // Create and export pack
        await fs.mkdir(path.join(repo, "existing", "modes"), { recursive: true });
        await fs.writeFile(path.join(repo, "existing", "pack.json"), JSON.stringify({ id: "existing" }));
        const exported = await exportPack({ repoPath: repo, packDirName: "existing", outDir });
        // Try to import into same repo (pack already exists)
        const result = await importPack({ bundlePath: exported.outPath, repoPath: repo, allowOverwrite: false });
        expect(result.ok).toBe(false);
        expect(result.message).toContain("exists");
    });
    it("allows import with allowOverwrite=true", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-pack-"));
        const repo = path.join(tmp, "repo");
        const outDir = path.join(tmp, ".mcp", "packs");
        // Create and export pack
        await fs.mkdir(path.join(repo, "overwrite", "modes"), { recursive: true });
        await fs.writeFile(path.join(repo, "overwrite", "pack.json"), JSON.stringify({ id: "overwrite", version: "1.0" }));
        const exported = await exportPack({ repoPath: repo, packDirName: "overwrite", outDir });
        // Import with overwrite
        const result = await importPack({ bundlePath: exported.outPath, repoPath: repo, allowOverwrite: true });
        expect(result.ok).toBe(true);
    });
});
//# sourceMappingURL=pack-io.test.js.map