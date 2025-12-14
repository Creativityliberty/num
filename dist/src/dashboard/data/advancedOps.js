import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
export function executeGitOps(root, input) {
    try {
        const cwd = root;
        let result = {};
        switch (input.operation) {
            case "branch": {
                const branchName = input.branchName || `feature/auto-${Date.now()}`;
                execSync(`git checkout -b ${branchName}`, { cwd, stdio: "pipe" });
                result = { branchName, created: true };
                break;
            }
            case "commit": {
                const message = input.message || "Auto-commit from dashboard";
                execSync(`git add -A`, { cwd, stdio: "pipe" });
                execSync(`git commit -m "${message}"`, { cwd, stdio: "pipe" });
                result = { message, committed: true };
                break;
            }
            case "push": {
                const remote = input.remote || "origin";
                const branch = execSync(`git rev-parse --abbrev-ref HEAD`, { cwd, encoding: "utf-8" }).trim();
                execSync(`git push ${remote} ${branch}`, { cwd, stdio: "pipe" });
                result = { remote, branch, pushed: true };
                break;
            }
            case "pr": {
                const branch = execSync(`git rev-parse --abbrev-ref HEAD`, { cwd, encoding: "utf-8" }).trim();
                result = {
                    branch,
                    prTitle: input.prTitle || "Auto PR from dashboard",
                    prBody: input.prBody || "Automated changes",
                    url: `https://github.com/user/repo/pull/new/${branch}`,
                };
                break;
            }
            case "bundle": {
                const bundleId = input.bundleId || `bundle-${Date.now()}`;
                const bundlePath = path.join(root, ".mcp", "bundles", `${bundleId}.json`);
                const bundleDir = path.dirname(bundlePath);
                if (!fs.existsSync(bundleDir))
                    fs.mkdirSync(bundleDir, { recursive: true });
                const bundleData = {
                    id: bundleId,
                    createdAt: new Date().toISOString(),
                    commit: execSync(`git rev-parse HEAD`, { cwd, encoding: "utf-8" }).trim(),
                    branch: execSync(`git rev-parse --abbrev-ref HEAD`, { cwd, encoding: "utf-8" }).trim(),
                };
                fs.writeFileSync(bundlePath, JSON.stringify(bundleData, null, 2));
                result = { bundleId, path: bundlePath, created: true };
                break;
            }
        }
        return { ok: true, operation: input.operation, result };
    }
    catch (e) {
        return {
            ok: false,
            operation: input.operation,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
export function executeBatchOp(root, input) {
    const startTime = Date.now();
    try {
        const catalogPath = path.join(root, "packs", input.packId || "num-pack", "catalog.json");
        if (!fs.existsSync(catalogPath)) {
            return {
                ok: false,
                operation: input.operation,
                count: 0,
                success: 0,
                failed: 0,
                duration: 0,
                error: "Catalog not found",
            };
        }
        const catalogData = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
        const items = (catalogData.items || catalogData.modes || []);
        const sample = input.sample || items.length;
        const toProcess = items.slice(0, Math.min(sample, items.length));
        let success = 0, failed = 0;
        const results = [];
        for (const item of toProcess) {
            try {
                const result = {
                    id: item.id,
                    operation: input.operation,
                    status: "success",
                    timestamp: new Date().toISOString(),
                };
                results.push(result);
                success++;
            }
            catch {
                failed++;
            }
        }
        const duration = Date.now() - startTime;
        return {
            ok: true,
            operation: input.operation,
            count: toProcess.length,
            success,
            failed,
            duration,
            results,
        };
    }
    catch (e) {
        return {
            ok: false,
            operation: input.operation,
            count: 0,
            success: 0,
            failed: 0,
            duration: Date.now() - startTime,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
export function generateReport(root, input) {
    try {
        const format = input.format || "json";
        const type = input.type;
        const range = input.range || "7d";
        let data = {};
        switch (type) {
            case "smoke": {
                const reportsDir = path.join(root, ".mcp", "reports", "smoke");
                const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json")) : [];
                data = {
                    type: "smoke",
                    range,
                    reportCount: files.length,
                    reports: files.slice(0, 10).map((f) => ({ id: f.replace(".json", ""), file: f })),
                };
                break;
            }
            case "health": {
                const reportsDir = path.join(root, ".mcp", "reports", "health");
                const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json")) : [];
                data = {
                    type: "health",
                    range,
                    reportCount: files.length,
                    reports: files.slice(0, 10).map((f) => ({ id: f.replace(".json", ""), file: f })),
                };
                break;
            }
            case "scoring": {
                const runsDir = path.join(root, ".mcp", "runs");
                const files = fs.existsSync(runsDir) ? fs.readdirSync(runsDir).filter((f) => f.endsWith(".json")) : [];
                data = {
                    type: "scoring",
                    range,
                    runCount: files.length,
                    topAgents: files.slice(0, 5).map((f) => ({ id: f.replace(".json", ""), file: f })),
                };
                break;
            }
            case "packops": {
                const reportsDir = path.join(root, ".mcp", "reports", "packops");
                const files = fs.existsSync(reportsDir) ? fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json")) : [];
                data = {
                    type: "packops",
                    range,
                    reportCount: files.length,
                    reports: files.slice(0, 10).map((f) => ({ id: f.replace(".json", ""), file: f })),
                };
                break;
            }
        }
        const reportPath = path.join(root, ".mcp", "reports", `${type}-${Date.now()}.${format === "json" ? "json" : format}`);
        const reportDir = path.dirname(reportPath);
        if (!fs.existsSync(reportDir))
            fs.mkdirSync(reportDir, { recursive: true });
        let content;
        if (format === "json") {
            content = JSON.stringify(data, null, 2);
        }
        else if (format === "csv") {
            content = JSON.stringify(data, null, 2); // Simplified CSV
        }
        else {
            content = `<html><body><h1>${type} Report</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
        }
        fs.writeFileSync(reportPath, content);
        return {
            ok: true,
            type,
            format,
            size: content.length,
            path: reportPath,
            data,
        };
    }
    catch (e) {
        return {
            ok: false,
            type: input.type,
            format: input.format || "json",
            size: 0,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}
