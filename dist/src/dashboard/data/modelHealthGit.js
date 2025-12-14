import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
function run(cmd, cwd) {
    try {
        return execSync(cmd, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    }
    catch (e) {
        const err = e;
        throw new Error(err.stderr || err.message || String(e));
    }
}
function nowBranchSuffix() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}
export function runGitBatchOps(input) {
    const cwd = input.workspaceRoot;
    const prefix = input.branchPrefix ?? "mcp/model-health-";
    const branchName = `${prefix}${nowBranchSuffix()}`;
    let commitHash;
    let bundlePath;
    try {
        // Check if git repo
        run("git rev-parse --git-dir", cwd);
        // Create branch if requested
        if (input.createBranch) {
            run(`git checkout -b ${branchName}`, cwd);
        }
        // Stage changed files
        if (input.changedFiles?.length) {
            for (const f of input.changedFiles) {
                const relPath = path.relative(cwd, f);
                run(`git add "${relPath}"`, cwd);
            }
        }
        else {
            // Stage all changes in packs/ and modes/
            run("git add packs/ modes/ || true", cwd);
        }
        // Commit if requested
        if (input.commit) {
            const msg = input.commitMessage ?? `chore(model-health): batch apply fallback suggestions`;
            try {
                run(`git commit -m "${msg}"`, cwd);
                commitHash = run("git rev-parse HEAD", cwd);
            }
            catch {
                // Nothing to commit is OK
            }
        }
        // Create bundle if requested
        if (input.createBundle && input.packId && input.packDir) {
            const packJsonPath = path.join(cwd, input.packDir, "pack.json");
            if (fs.existsSync(packJsonPath)) {
                const pack = JSON.parse(fs.readFileSync(packJsonPath, "utf-8"));
                const modesDir = path.join(cwd, "modes", input.packId.replace("-pack", ""));
                const modes = [];
                if (fs.existsSync(modesDir)) {
                    const files = fs.readdirSync(modesDir).filter((f) => f.endsWith(".json"));
                    for (const f of files) {
                        try {
                            modes.push(JSON.parse(fs.readFileSync(path.join(modesDir, f), "utf-8")));
                        }
                        catch {
                            // Skip corrupt
                        }
                    }
                }
                const bundle = {
                    pack,
                    modes,
                    createdAt: new Date().toISOString(),
                    branch: input.createBranch ? branchName : undefined,
                    commit: commitHash,
                };
                const bundleDir = path.join(cwd, ".mcp", "bundles");
                fs.mkdirSync(bundleDir, { recursive: true });
                bundlePath = path.join(bundleDir, `${input.packId}-${nowBranchSuffix()}.json`);
                fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), "utf-8");
            }
        }
        return {
            ok: true,
            branchName: input.createBranch ? branchName : undefined,
            commitHash,
            bundlePath,
        };
    }
    catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
