import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { URL, fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { ModesRegistry } from "../core/modes.registry.js";
import { PolicySchema } from "../core/policy.js";
import { rollbackWorkspace } from "../server/workspace.js";
import { executeBatchOp, executeGitOps, generateReport } from "./data/advancedOps.js";
import { getAgentDetail, getAgentHealth, getAgentRuns } from "./data/agentDetail.js";
import { replayLatestDoneRuns } from "./data/batch.js";
import { loadCatalog, writeCatalog } from "./data/catalog.js";
import { compareRunToReplay } from "./data/compare.js";
import { getCustomModesStats, loadCustomModes } from "./data/customModes.js";
import { createMode, duplicateMode, openMode, writeMode } from "./data/editor.js";
import { calculateLayout, generateFlowGraph, generateSVG } from "./data/flowGraph.js";
import { installPack, listMarketplacePacks, publishPack } from "./data/marketplace.js";
import { handleMcpRequest } from "./data/mcpApi.js";
import { MCP_TOOLS, getAllCategories, getToolsByCategory } from "./data/mcpTools.js";
import { computeModelHealthFromEvents, loadTelemetryEvents, suggestFallbacks } from "./data/modelHealth.js";
import { applyModelFallbackSuggestion } from "./data/modelHealthApply.js";
import { runBatchApply } from "./data/modelHealthBatch.js";
import { listModelHealthBatchReports, loadModelHealthBatchReport } from "./data/modelHealthBatchReports.js";
import { runGitBatchOps } from "./data/modelHealthGit.js";
import { listModelHealthReports, loadModelHealthReport } from "./data/modelHealthReports.js";
import { runPackOps } from "./data/packops.js";
import { CacheManager, IndexManager } from "./data/performance.js";
import { simulateMode, validateMode } from "./data/playground.js";
import { RealtimeManager } from "./data/realtimeUpdates.js";
import { replayDryRun } from "./data/replay.js";
import { downloadReplayJSON, listReplays, loadReplay } from "./data/replays.js";
import { listReports, loadReport } from "./data/reports.js";
import { exportRunJSON, hasBackup, importRunJSON, listRuns, loadBundleForSession, loadRun, saveRun } from "./data/runs.js";
import { computeScoring, suggestAgents } from "./data/scoring.js";
import { AuditLogger, RBACManager } from "./data/security.js";
import { runSmoke } from "./data/smoke.js";
import { computeStats } from "./data/stats.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realtimeManager = new RealtimeManager();
async function readBody(req) {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    await new Promise((r) => req.on("end", () => r()));
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
    }
    catch {
        return {};
    }
}
async function loadModernTemplate() {
    try {
        const templatePath = path.join(__dirname, "templates", "modern.html");
        return await fs.readFile(templatePath, "utf-8");
    }
    catch {
        return html(); // Fallback to legacy
    }
}
function esc(s) {
    return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function modelHealthPage() {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Model Health — Num Agents Cockpit</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 0; background: #0b0f14; color: #e8eef6; }
    .top { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #1d2733; background:#0d131b; position:sticky; top:0; z-index:10;}
    .brand { font-weight:700; letter-spacing:0.2px; }
    .nav { display:flex; gap:10px; flex-wrap:wrap; }
    .navlink { color:#a9bed6; text-decoration:none; padding:6px 10px; border-radius:10px; border:1px solid transparent; }
    .navlink:hover { border-color:#223244; background:#0f1722; }
    .navlink.active { color:#e8eef6; border-color:#2a3b50; background:#0f1722; }
    .wrap { padding: 16px; max-width: 1200px; margin: 0 auto; }
    .card { background:#0d131b; border:1px solid #1d2733; border-radius:16px; padding:14px; box-shadow: 0 0 0 1px rgba(0,0,0,0.1); }
    .row { display:flex; gap:12px; flex-wrap:wrap; }
    .grow { flex: 1 1 auto; }
    .btn { cursor:pointer; border:1px solid #2a3b50; background:#0f1722; color:#e8eef6; padding:8px 10px; border-radius:12px; }
    .btn:hover { background:#122034; }
    select, input { border:1px solid #2a3b50; background:#0f1722; color:#e8eef6; padding:8px 10px; border-radius:12px; }
    table { width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border-radius:14px; border:1px solid #1d2733; }
    th, td { padding:10px 10px; border-bottom:1px solid #1d2733; vertical-align:top; }
    th { text-align:left; font-size:12px; color:#a9bed6; background:#0f1722; }
    tr:last-child td { border-bottom:none; }
    .muted { color:#a9bed6; font-size:12px; }
    .pill { display:inline-flex; align-items:center; gap:6px; border:1px solid #2a3b50; background:#0f1722; padding:4px 8px; border-radius:999px; font-size:12px; color:#e8eef6; }
    .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
    @media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }
    .heat { width: 64px; height: 14px; border-radius: 999px; border:1px solid #2a3b50; background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%); position:relative; overflow:hidden;}
    .heat > div { height:100%; }
    .code { white-space:pre; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono"; background:#0b0f14; border:1px solid #1d2733; border-radius:14px; padding:10px; overflow:auto; font-size:12px; }
    .ok { color:#6ee7b7; }
    .bad { color:#fb7185; }
    .warn { color:#fbbf24; }
  </style>
</head>
<body>
  <div class="top">
    <div class="brand">Num Agents Cockpit</div>
    <div class="nav">
      <a class="navlink" href="/">Dashboard</a>
      <a class="navlink active" href="/model-health">Model Health</a>
    </div>
  </div>
  <div class="wrap">
    <div class="row">
      <div class="card grow">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <div style="font-size:18px; font-weight:700;">Model Health</div>
            <div class="muted">Heatmap 429/5xx/timeouts + score. Suggestions de fallback basées sur telemetry.</div>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <label class="muted">Range</label>
            <select id="mhRange">
              <option value="24h">24h</option>
              <option value="7d" selected>7d</option>
              <option value="30d">30d</option>
              <option value="all">all</option>
            </select>
            <label class="muted">minCalls</label>
            <input id="mhMinCalls" type="number" min="1" value="20" style="width:88px;"/>
            <button class="btn" id="mhRefresh">Refresh</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid2" style="margin-top:12px;">
      <div class="card">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-weight:700;">Heatmap</div>
          <div class="muted" id="mhMeta"></div>
        </div>
        <div style="margin-top:10px; overflow:auto;">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Calls</th>
                <th>429</th>
                <th>5xx</th>
                <th>Timeout</th>
                <th>p95</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody id="mhRows">
              <tr><td colspan="7" class="muted">Loading…</td></tr>
            </tbody>
          </table>
        </div>
        <div class="muted" style="margin-top:10px;">
          Score = heuristique (429/5xx/timeout + latence). Plus haut = meilleur.
        </div>
      </div>

      <div class="card">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="font-weight:700;">Suggestions</div>
          <button class="btn" id="mhCopyAll">Copy snippets</button>
        </div>
        <div class="muted" style="margin-top:6px;">
          Une suggestion = "remplacer fallback" (même provider) quand le score est nettement meilleur.
        </div>
        <div style="margin-top:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <span class="muted">Apply target</span>
          <select id="mhApplyTarget">
            <option value="packDefaults" selected>Pack defaults</option>
            <option value="mode">Selected mode</option>
          </select>
          <input id="mhModeId" placeholder="num:some-agent" style="min-width:180px;" />
        </div>
        <div style="margin-top:12px; padding:12px; border:1px solid #2a3b50; border-radius:12px; background:#0f1722;">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span style="font-weight:700;">Batch Apply</span>
            <span class="muted">top</span>
            <input id="mhTopN" type="number" min="1" max="50" value="5" style="width:60px;" />
            <button class="btn" id="mhBatchPreview">Preview</button>
            <button class="btn" id="mhBatchApply" style="background:#1a4d1a; border-color:#2a6b2a;">Apply top N</button>
          </div>
          <div class="muted" style="margin-top:6px;">Applique les N meilleures suggestions d'un coup. Preview = dry-run.</div>
        </div>
        <div style="margin-top:12px; padding:12px; border:1px solid #2a3b50; border-radius:12px; background:#0f1722;">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span style="font-weight:700;">Git Ops</span>
            <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" id="mhGitBranch" /> Branch</label>
            <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" id="mhGitCommit" /> Commit</label>
            <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" id="mhGitBundle" /> Bundle</label>
            <input id="mhBranchPrefix" placeholder="mcp/model-health-" style="width:160px;" value="mcp/model-health-" />
            <button class="btn" id="mhGitRun">Run Git Ops</button>
          </div>
          <div class="muted" style="margin-top:6px;">Après batch apply: crée branche, commit, et/ou bundle PR. Requiert allowGit=true.</div>
          <div id="mhGitOut" class="muted" style="margin-top:6px;"></div>
        </div>
        <div id="mhSug" style="margin-top:10px;">
          <div class="muted">Loading…</div>
        </div>
        <div style="margin-top:12px;">
          <div class="muted">Patch snippet (runtimePolicy)</div>
          <div class="code" id="mhSnippet">{}</div>
        </div>
        <div style="margin-top:12px;">
          <div class="muted">Batch output</div>
          <div class="code" id="mhBatchOut" style="max-height:200px; overflow:auto;">[]</div>
        </div>
        <div style="margin-top:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div class="muted">Batch Reports History</div>
            <button class="btn" id="mhLoadReports">Load</button>
          </div>
          <div id="mhReportsList" style="margin-top:6px; max-height:150px; overflow:auto;">
            <div class="muted">Click Load to see reports</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);

    function clamp01(x){ return Math.max(0, Math.min(1, x)); }
    function pct(n, d){ d = Math.max(1, d); return (n/d); }

    function heatBar(rate){
      const w = Math.round(clamp01(rate) * 100);
      const alpha = Math.max(0.08, clamp01(rate) * 0.9);
      return '<div class="heat"><div style="width:'+w+'%; background: rgba(255,100,100,'+alpha+');"></div></div>';
    }

    function badgeScore(score){
      if (score >= 90) return '<span class="pill ok">score '+score+'</span>';
      if (score >= 75) return '<span class="pill warn">score '+score+'</span>';
      return '<span class="pill bad">score '+score+'</span>';
    }

    function fmtMs(ms){
      if (ms == null) return '-';
      if (ms < 1000) return ms+'ms';
      return (ms/1000).toFixed(1)+'s';
    }

    function setSnippet(obj){
      $('mhSnippet').textContent = JSON.stringify(obj, null, 2);
    }

    let suggestions = [];

    async function refresh(){
      $('mhRows').innerHTML = '<tr><td colspan="7" class="muted">Loading…</td></tr>';
      $('mhSug').innerHTML = '<div class="muted">Loading…</div>';
      setSnippet({});

      const range = $('mhRange').value;
      const minCalls = Number($('mhMinCalls').value || 20);

      const r = await fetch('/api/model-health?range=' + encodeURIComponent(range));
      const j = await r.json();
      if (!j.ok){
        $('mhRows').innerHTML = '<tr><td colspan="7" class="bad">Failed to load model health</td></tr>';
        return;
      }

      const report = j.report;
      $('mhMeta').textContent = 'range ' + report.range + ' — calls ' + report.totals.calls;

      const rows = report.rows || [];
      if (!rows.length){
        $('mhRows').innerHTML = '<tr><td colspan="7" class="muted">No telemetry events yet.</td></tr>';
      } else {
        $('mhRows').innerHTML = rows.map((x) => {
          const calls = Math.max(1, x.calls);
          const r429 = pct(x.rate429, calls);
          const r5xx = pct(x.err5xx, calls);
          const rTo = pct(x.timeouts, calls);
          const modelLabel = x.provider + ':' + x.model;
          return '<tr>' +
            '<td><div style="font-weight:700;">'+modelLabel+'</div><div class="muted">lastSeen: '+(x.lastSeen || '-').slice(0,10)+'</div></td>' +
            '<td>'+x.calls+'</td>' +
            '<td>'+heatBar(r429)+'<div class="muted">'+(r429*100).toFixed(1)+'%</div></td>' +
            '<td>'+heatBar(r5xx)+'<div class="muted">'+(r5xx*100).toFixed(1)+'%</div></td>' +
            '<td>'+heatBar(rTo)+'<div class="muted">'+(rTo*100).toFixed(1)+'%</div></td>' +
            '<td>'+fmtMs(x.p95Ms)+'</td>' +
            '<td>'+badgeScore(x.healthScore)+'</td>' +
          '</tr>';
        }).join('');
      }

      const rs = await fetch('/api/model-health/suggestions?range=' + encodeURIComponent(range) + '&minCalls=' + encodeURIComponent(String(minCalls)));
      const js = await rs.json();
      suggestions = (js && js.suggestions) ? js.suggestions : [];

      if (!suggestions.length){
        $('mhSug').innerHTML = '<div class="muted">No suggestions (yet). Increase sample size or range.</div>';
        return;
      }

      const first = suggestions[0];
      setSnippet({ runtimePolicy: { model: { preferred: first.from, fallbacks: [first.to] } } });

      $('mhSug').innerHTML = suggestions.slice(0, 12).map((s, idx) => {
        const conf = s.confidence;
        const confPill = '<span class="pill">'+conf+'</span>';
        const from = s.from.provider + ':' + s.from.model;
        const to = s.to.provider + ':' + s.to.model;
        return '<div class="card" style="margin-bottom:10px; padding:12px;">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">' +
            '<div style="font-weight:700;">'+from+' → '+to+'</div>' +
            '<div style="display:flex; gap:8px; align-items:center;">' +
              confPill +
              '<button class="btn" data-copy="'+idx+'">Copy</button>' +
              '<button class="btn" data-use="'+idx+'">Preview</button>' +
              '<button class="btn" data-apply="'+idx+'">Apply</button>' +
            '</div>' +
          '</div>' +
          '<div class="muted" style="margin-top:6px;">'+s.reason+'</div>' +
          '<div class="muted" style="margin-top:6px;">fromScore '+s.metrics.fromScore+' → toScore '+s.metrics.toScore+'</div>' +
        '</div>';
      }).join('');

      $('mhSug').querySelectorAll('button[data-use]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-use'));
          const s = suggestions[idx];
          setSnippet({ runtimePolicy: { model: { preferred: s.from, fallbacks: [s.to] } } });
        });
      });

      $('mhSug').querySelectorAll('button[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idx = Number(btn.getAttribute('data-copy'));
          const s = suggestions[idx];
          const text = JSON.stringify({ runtimePolicy: { model: { preferred: s.from, fallbacks: [s.to] } } }, null, 2);
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied';
          setTimeout(() => (btn.textContent = 'Copy'), 900);
        });
      });

      $('mhSug').querySelectorAll('button[data-apply]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idx = Number(btn.getAttribute('data-apply'));
          const s = suggestions[idx];
          await doApply(s, false);
        });
      });

      $('mhCopyAll').onclick = async () => {
        const all = suggestions.slice(0, 12).map((s) => ({
          runtimePolicy: { model: { preferred: s.from, fallbacks: [s.to] } }
        }));
        await navigator.clipboard.writeText(JSON.stringify(all, null, 2));
        $('mhCopyAll').textContent = 'Copied';
        setTimeout(() => ($('mhCopyAll').textContent = 'Copy snippets'), 900);
      };
    }

    async function doApply(s, dryRun){
      const applyTarget = $('mhApplyTarget').value;
      const modeId = $('mhModeId').value || undefined;
      if (applyTarget === 'mode' && !modeId) {
        alert('Please set modeId (ex: num:code-fix) when applyTarget=mode');
        return;
      }
      const body = {
        packId: 'num-pack',
        packDir: './packs/num-pack',
        modesDir: './modes/num',
        applyTarget,
        modeId,
        from: s.from,
        to: s.to,
        dryRun: !!dryRun
      };
      const r = await fetch('/api/model-health/apply-suggestion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j.ok){
        alert('Apply failed: ' + (j.error || 'unknown'));
        return;
      }
      const msg = dryRun ? 'Dry-run OK\\n' : 'Applied OK\\n';
      alert(msg + JSON.stringify(j.result, null, 2));
    }

    async function doBatch(dryRun){
      const range = $('mhRange').value;
      const minCalls = Number($('mhMinCalls').value || 20);
      const topN = Number($('mhTopN').value || 5);
      const applyTarget = $('mhApplyTarget').value;
      const modeId = $('mhModeId').value || undefined;
      if (applyTarget === 'mode' && !modeId) {
        alert('Please set modeId (ex: num:code-fix) when applyTarget=mode');
        return;
      }
      $('mhBatchOut').textContent = 'Loading...';
      const body = {
        range,
        minCalls,
        topN,
        dryRun: !!dryRun,
        packId: 'num-pack',
        packDir: './packs/num-pack',
        modesDir: './modes/num',
        applyTarget,
        modeId
      };
      const r = await fetch('/api/model-health/batch-apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j.ok){
        $('mhBatchOut').textContent = 'Error: ' + (j.error || j.message || 'unknown');
        return;
      }
      $('mhBatchOut').textContent = JSON.stringify(j.result, null, 2);
      if (!dryRun && j.result.reportPath){
        alert('Batch applied! Report: ' + j.result.reportPath);
      }
    }

    async function loadBatchReports(){
      $('mhReportsList').innerHTML = '<div class="muted">Loading...</div>';
      const r = await fetch('/api/reports/model-health-batch');
      const j = await r.json();
      if (!j.ok || !j.reports.length){
        $('mhReportsList').innerHTML = '<div class="muted">No reports yet</div>';
        return;
      }
      $('mhReportsList').innerHTML = j.reports.slice(0, 10).map((rep) =>
        '<div style="padding:4px 0; border-bottom:1px solid #1d2733;"><a href="/api/reports/model-health-batch/' + rep.id + '" target="_blank" style="color:#a9bed6;">' + rep.id + '</a></div>'
      ).join('');
    }

    $('mhBatchPreview').onclick = () => doBatch(true);
    $('mhBatchApply').onclick = () => doBatch(false);
    $('mhLoadReports').onclick = loadBatchReports;

    async function doGitOps(){
      const createBranch = $('mhGitBranch').checked;
      const commit = $('mhGitCommit').checked;
      const createBundle = $('mhGitBundle').checked;
      const branchPrefix = $('mhBranchPrefix').value || 'mcp/model-health-';
      if (!createBranch && !commit && !createBundle){
        $('mhGitOut').textContent = 'Select at least one option (Branch, Commit, or Bundle)';
        return;
      }
      $('mhGitOut').textContent = 'Running git ops...';
      const body = {
        createBranch,
        commit,
        createBundle,
        branchPrefix,
        packId: 'num-pack',
        packDir: './packs/num-pack'
      };
      const r = await fetch('/api/model-health/git-ops', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j.ok){
        $('mhGitOut').innerHTML = '<span class="bad">Error: ' + (j.error || j.message || 'unknown') + '</span>';
        return;
      }
      const res = j.result;
      let msg = '<span class="ok">OK</span>';
      if (res.branchName) msg += ' | Branch: ' + res.branchName;
      if (res.commitHash) msg += ' | Commit: ' + res.commitHash.slice(0, 8);
      if (res.bundlePath) msg += ' | Bundle: ' + res.bundlePath;
      $('mhGitOut').innerHTML = msg;
    }

    $('mhGitRun').onclick = doGitOps;

    $('mhRefresh').addEventListener('click', refresh);
    refresh();
  </script>
</body>
</html>`;
}
function html() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>mcp-agents-modes — Dashboard</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; }
      header { padding: 12px 16px; border-bottom: 1px solid #ddd; display: flex; gap: 12px; align-items: center; }
      header h1 { font-size: 16px; margin: 0; }
      main { padding: 12px 16px; }
      .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
      input, select { padding: 6px 8px; border: 1px solid #ccc; border-radius: 8px; }
      .pill { font-size: 12px; padding: 2px 8px; border: 1px solid #ccc; border-radius: 999px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; border-bottom: 1px solid #eee; padding: 8px; vertical-align: top; }
      th { font-size: 12px; color: #555; }
      td { font-size: 13px; }
      .ok { color: #0a7; }
      .err { color: #c30; }
      .muted { color: #666; }
      pre { margin: 0; white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <header>
      <h1>mcp-agents-modes — Dashboard</h1>
      <span id="status" class="pill">connecting…</span>
      <span id="count" class="pill muted">events: 0</span>
    </header>
    <main>
      <div class="row">
        <label>Session:
          <select id="sessionFilter">
            <option value="">(all)</option>
          </select>
        </label>
        <label>Filter tool:
          <select id="toolFilter">
            <option value="">(all)</option>
            <option value="modes.list">modes.list</option>
            <option value="modes.get">modes.get</option>
            <option value="modes.suggest">modes.suggest</option>
            <option value="modes.render">modes.render</option>
            <option value="modes.plan">modes.plan</option>
            <option value="modes.planPrompt">modes.planPrompt</option>
            <option value="modes.runPrompt">modes.runPrompt</option>
            <option value="modes.reviewPrompt">modes.reviewPrompt</option>
            <option value="workspace.applyPatch">workspace.applyPatch</option>
            <option value="exec.run">exec.run</option>
            <option value="git.status">git.status</option>
            <option value="git.diff">git.diff</option>
            <option value="git.log">git.log</option>
            <option value="git.branch.create">git.branch.create</option>
            <option value="git.commit">git.commit</option>
            <option value="pipeline.applyAndVerify">pipeline.applyAndVerify</option>
            <option value="bundle.pr.create">bundle.pr.create</option>
            <option value="orchestrate.run">orchestrate.run</option>
            <option value="orchestrate.continue">orchestrate.continue</option>
            <option value="orchestrate.status">orchestrate.status</option>
            <option value="orchestrate.cancel">orchestrate.cancel</option>
          </select>
        </label>
        <label>Type:
          <select id="typeFilter">
            <option value="">(all)</option>
            <option value="runtime.started">runtime.started</option>
            <option value="tool.called">tool.called</option>
            <option value="tool.succeeded">tool.succeeded</option>
            <option value="tool.failed">tool.failed</option>
            <option value="rollback">rollback</option>
          </select>
        </label>
        <label>Search:
          <input id="q" placeholder="best mode id, error code, etc." />
        </label>
        <button id="clear">Clear</button>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 170px;">Time</th>
            <th style="width: 120px;">Session</th>
            <th style="width: 140px;">Event</th>
            <th style="width: 140px;">Tool</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>

      <h2 style="margin-top:24px;">Runs</h2>
      <div class="row" style="margin-bottom:12px;">
        <button id="refreshRunsBtn">Refresh Runs</button>
      </div>
      <div style="display:flex; gap:16px;">
        <div style="min-width:280px;">
          <select id="runsList" size="10" style="width:100%;font-family:monospace;"></select>
        </div>
        <div style="flex:1;">
          <div class="row" style="margin-bottom:8px;">
            <button id="exportRunBtn" disabled>Export</button>
            <button id="replayBtn" disabled>Replay dry-run</button>
            <button id="rollbackBtn" disabled style="background:#c30;color:#fff;">Rollback</button>
          </div>
          <div id="runDetails" style="background:#f5f5f5;padding:12px;border-radius:6px;min-height:200px;font-size:13px;">
            <span class="muted">Select a run…</span>
          </div>
        </div>
      </div>

      <h2 style="margin-top:24px;">Modes Registry</h2>
      <div class="row" style="margin-bottom:12px;">
        <button id="refreshModesBtn">Refresh Modes</button>
        <input id="modesSearch" placeholder="Search modes..." style="width:200px;" />
      </div>
      <div style="display:flex; gap:16px;">
        <div style="min-width:400px;">
          <table id="modesTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Nodes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="modesTbody"></tbody>
          </table>
        </div>
        <div style="flex:1;">
          <div id="modeDetails" style="background:#f5f5f5;padding:12px;border-radius:6px;min-height:200px;font-size:13px;">
            <span class="muted">Select a mode or click Simulate…</span>
          </div>
        </div>
      </div>

      <h2 style="margin-top:24px;">Packs</h2>
      <div class="row" style="margin-bottom:12px;">
        <button id="refreshPacksBtn">Refresh Packs</button>
        <span class="muted" style="margin-left:12px;">Export/import via MCP tools: <code>pack.export</code> / <code>pack.import</code></span>
      </div>
      <table id="packsTable">
        <thead>
          <tr>
            <th>File</th>
            <th>ID</th>
            <th>Version</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="packsTbody"></tbody>
      </table>
    </main>

    <script>
      const statusEl = document.getElementById("status");
      const countEl = document.getElementById("count");
      const tbody = document.getElementById("tbody");
      const sessionFilter = document.getElementById("sessionFilter");
      const toolFilter = document.getElementById("toolFilter");
      const typeFilter = document.getElementById("typeFilter");
      const qEl = document.getElementById("q");
      const clearBtn = document.getElementById("clear");

      let events = [];

      function rebuildSessionOptions() {
        const sessions = [...new Set(events.map(e => e.sessionId).filter(Boolean))];
        const cur = sessionFilter.value || "";
        sessionFilter.innerHTML =
          '<option value="">(all)</option>' +
          sessions.map(s => '<option value="' + s + '">' + s.slice(0, 8) + '</option>').join("");
        if (cur) sessionFilter.value = cur;
      }

      function matches(ev) {
        const sf = sessionFilter.value;
        const tf = toolFilter.value;
        const ty = typeFilter.value;
        const q = (qEl.value || "").toLowerCase().trim();

        if (sf && ev.sessionId !== sf) return false;
        if (tf && (ev.data?.tool !== tf)) return false;
        // 11.4.2: support rollback type filter
        if (ty) {
          if (ty === "rollback") {
            if (ev.type !== "rollback") return false;
          } else if (ev.name !== ty && ev.type !== ty) {
            return false;
          }
        }
        if (!q) return true;

        const hay = JSON.stringify(ev).toLowerCase();
        return hay.includes(q);
      }

      function render() {
        rebuildSessionOptions();
        const filtered = events.filter(matches).slice(-500).reverse();
        countEl.textContent = "events: " + events.length + " (showing " + filtered.length + ")";

        tbody.innerHTML = "";
        for (const ev of filtered) {
          const tr = document.createElement("tr");
          const t = new Date(ev.ts).toLocaleTimeString();
          const tool = ev.data?.tool || "";
          const name = ev.name || ev.type || "";
          const sid = (ev.sessionId || "").slice(0, 8);

          // 11.4.2: enriched rollback event display
          if (ev.type === "rollback") {
            const okBadge = ev.ok ? '<span style="background:#0a7;color:#fff;padding:2px 6px;border-radius:4px;">OK</span>' : '<span style="background:#c30;color:#fff;padding:2px 6px;border-radius:4px;">FAIL</span>';
            tr.innerHTML = \`
              <td class="muted">\${t}</td>
              <td class="muted">\${sid}</td>
              <td><strong>rollback</strong> \${okBadge}</td>
              <td><a href="#" onclick="if(typeof loadRunDetails==='function')loadRunDetails('\${escapeHtml(ev.runId || "")}');return false;" style="font-family:monospace;">\${escapeHtml((ev.runId || "").slice(0,8))}</a></td>
              <td><pre>source: \${escapeHtml(ev.source || "unknown")}\${ev.restoredCount != null ? "\\nrestored: " + ev.restoredCount : ""}\${ev.message ? "\\nmessage: " + escapeHtml(ev.message) : ""}</pre></td>
            \`;
          } else {
            const cls = name === "tool.failed" ? "err" : (name === "tool.succeeded" ? "ok" : "");
            tr.innerHTML = \`
              <td class="muted">\${t}</td>
              <td class="muted">\${sid}</td>
              <td class="\${cls}">\${name}</td>
              <td>\${tool}</td>
              <td><pre>\${escapeHtml(JSON.stringify(ev.data, null, 2))}</pre></td>
            \`;
          }
          tbody.appendChild(tr);
        }
      }

      function escapeHtml(s) {
        return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
      }

      function connect() {
        const proto = location.protocol === "https:" ? "wss" : "ws";
        const ws = new WebSocket(proto + "://" + location.host + "/ws");

        ws.onopen = () => {
          statusEl.textContent = "connected";
          statusEl.className = "pill ok";
        };
        ws.onclose = () => {
          statusEl.textContent = "disconnected";
          statusEl.className = "pill err";
          setTimeout(connect, 700);
        };
        ws.onerror = () => {};
        ws.onmessage = (msg) => {
          try {
            const payload = JSON.parse(msg.data);
            if (payload.type === "snapshot") {
              events = payload.events || [];
            } else if (payload.type === "event") {
              events.push(payload.event);
            }
            render();
          } catch (_) {}
        };
      }

      sessionFilter.onchange = render;
      toolFilter.onchange = render;
      typeFilter.onchange = render;
      qEl.oninput = render;
      clearBtn.onclick = () => { events = []; render(); };

      connect();

      // Runs management (11.4)
      const runsList = document.getElementById("runsList");
      const refreshRunsBtn = document.getElementById("refreshRunsBtn");
      const exportRunBtn = document.getElementById("exportRunBtn");
      const replayBtn = document.getElementById("replayBtn");
      const rollbackBtn = document.getElementById("rollbackBtn");
      const runDetails = document.getElementById("runDetails");

      let currentRunId = null;
      let currentRollbackAvailable = false;
      let currentPolicy = null;

      async function loadRuns() {
        try {
          const res = await fetch("/api/runs");
          const data = await res.json();
          runsList.innerHTML = "";
          for (const r of (data.runs || [])) {
            const opt = document.createElement("option");
            opt.value = r.runId;
            opt.textContent = r.runId.slice(0,8) + " | " + r.state + " | " + (r.modeId || "-");
            runsList.appendChild(opt);
          }
        } catch (e) {
          runsList.innerHTML = "<option>(error loading runs)</option>";
        }
      }

      async function loadRunDetails(runId) {
        currentRunId = runId;
        exportRunBtn.disabled = false;
        replayBtn.disabled = false;
        rollbackBtn.disabled = true;
        try {
          const [runRes, policyRes] = await Promise.all([
            fetch("/api/runs/" + encodeURIComponent(runId)),
            fetch("/api/policy")
          ]);
          const runData = await runRes.json();
          currentPolicy = await policyRes.json();
          const run = runData.run;
          currentRollbackAvailable = !!runData.rollbackAvailable;
          const rollbackInCooldown = !!runData.rollbackInCooldown;
          const lastRollbackAgeSec = runData.lastRollbackAgeSec;

          // 11.5: enable rollback only if available + allowWrite + not in cooldown
          const canRollback = currentRollbackAvailable && currentPolicy.allowWrite && !rollbackInCooldown;
          rollbackBtn.disabled = !canRollback;
          rollbackBtn.textContent = rollbackInCooldown ? "Rollback (cooldown)" : "Rollback";

          const lastRb = run.rollback ? JSON.stringify(run.rollback, null, 2) : "(none)";
          const hist = (run.history || []).map(h => h.ts + " " + h.from + " → " + h.to + (h.note ? " — " + h.note : "")).join("\\n");
          const cooldownStatus = rollbackInCooldown
            ? "already rolled back (" + lastRollbackAgeSec + "s ago) — cooldown active"
            : "ready";

          // 12.4: render jobs table
          const jobs = run.agents?.jobs || [];
          const jobsHtml = jobs.length ? \`
            <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
              <thead><tr style="background:#f5f5f5;"><th style="padding:4px;text-align:left;">jobId</th><th>role</th><th>status</th><th>duration</th><th>goal</th></tr></thead>
              <tbody>\${jobs.map(j => {
                const dur = (j.startedAt && j.finishedAt) ? (new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime()) + "ms" : "-";
                return \`<tr><td style="padding:4px;font-family:monospace;">\${escapeHtml(j.jobId)}</td><td>\${escapeHtml(j.role)}</td><td>\${escapeHtml(j.status || "pending")}</td><td>\${escapeHtml(dur)}</td><td style="color:#666;">\${escapeHtml(j.goal || "")}</td></tr>\`;
              }).join("")}</tbody>
            </table>
          \` : "<div style='color:#999;'>No agents/jobs data</div>";

          // 19.3: render telemetry (models)
          const telemetry = Array.isArray(run.telemetry) ? run.telemetry : [];
          const telemetryCount = telemetry.length;
          const fallbackCount = telemetry.filter(t => (t.attempts || []).length > 1).length;
          const totalTokens = telemetry.reduce((sum, t) => sum + ((t.usage?.inputTokens || 0) + (t.usage?.outputTokens || 0)), 0);
          const telemetryHtml = telemetryCount === 0 ? '<div style="color:#999;">No telemetry data</div>' : \`
            <div style="margin-bottom:8px;">
              <span style="background:#369;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;">Steps: \${telemetryCount}</span>
              <span style="background:\${fallbackCount > 0 ? '#f90' : '#0a7'};color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:4px;">Fallbacks: \${fallbackCount}</span>
              <span style="background:#666;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:4px;">Tokens: \${totalTokens.toLocaleString()}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:11px;">
              <thead><tr style="background:#f5f5f5;"><th style="padding:4px;text-align:left;">ts</th><th>step/job</th><th>role</th><th>chosen</th><th>attempts</th><th>fallback</th><th>tokens</th></tr></thead>
              <tbody>\${telemetry.slice(-20).reverse().map(t => {
                const who = t.jobId ? 'job:' + t.jobId.slice(0,8) : t.stepId ? 'step:' + t.stepId : '-';
                const role = t.role || '-';
                const chosen = t.chosenModel ? t.chosenModel.provider + ':' + t.chosenModel.model : '-';
                const attempts = (t.attempts || []).length;
                const fallback = attempts > 1 ? '<span style="color:#f90;font-weight:bold;">YES</span>' : 'no';
                const tokens = t.usage ? (t.usage.inputTokens || 0) + '/' + (t.usage.outputTokens || 0) : '-';
                return '<tr><td style="padding:3px;">' + new Date(t.ts).toLocaleTimeString() + '</td><td>' + escapeHtml(who) + '</td><td>' + escapeHtml(role) + '</td><td style="font-family:monospace;font-size:10px;">' + escapeHtml(chosen) + '</td><td>' + attempts + '</td><td>' + fallback + '</td><td>' + tokens + '</td></tr>';
              }).join('')}</tbody>
            </table>
            <details style="margin-top:6px;"><summary style="cursor:pointer;">Raw telemetry JSON</summary><pre style="background:#fff;padding:6px;font-size:10px;max-height:150px;overflow:auto;">\${escapeHtml(JSON.stringify(telemetry, null, 2))}</pre></details>
          \`;

          // 12.4: render artifacts
          const artifacts = run.agents?.artifacts || {};
          const cands = Array.isArray(artifacts.candidates) ? artifacts.candidates.length : 0;
          const artifactsHtml = \`
            <div style="color:#666;">chosenCandidateId: <code>\${escapeHtml(artifacts.chosenCandidateId || "-")}</code></div>
            <div style="color:#666;">candidates: <code>\${cands}</code></div>
            <details style="margin-top:6px;"><summary style="cursor:pointer;">multiPlan</summary><pre style="background:#fff;padding:6px;font-size:11px;max-height:100px;overflow:auto;">\${escapeHtml(JSON.stringify(artifacts.multiPlan || null, null, 2))}</pre></details>
            <details style="margin-top:4px;"><summary style="cursor:pointer;">patchCandidate (chosen)</summary><pre style="background:#fff;padding:6px;font-size:11px;max-height:100px;overflow:auto;">\${escapeHtml(JSON.stringify(artifacts.patchCandidate || null, null, 2))}</pre></details>
            <details style="margin-top:4px;"><summary style="cursor:pointer;">candidates[]</summary><pre style="background:#fff;padding:6px;font-size:11px;max-height:100px;overflow:auto;">\${escapeHtml(JSON.stringify(artifacts.candidates || [], null, 2))}</pre></details>
            <details style="margin-top:4px;"><summary style="cursor:pointer;">review</summary><pre style="background:#fff;padding:6px;font-size:11px;max-height:100px;overflow:auto;">\${escapeHtml(JSON.stringify(artifacts.review || null, null, 2))}</pre></details>
            <details style="margin-top:4px;"><summary style="cursor:pointer;">security</summary><pre style="background:#fff;padding:6px;font-size:11px;max-height:100px;overflow:auto;">\${escapeHtml(JSON.stringify(artifacts.security || null, null, 2))}</pre></details>
          \`;

          runDetails.innerHTML = \`
            <div><strong>\${escapeHtml(run.runId)}</strong> <span style="background:#eee;padding:2px 6px;border-radius:4px;">\${escapeHtml(run.state)}</span></div>
            <div style="margin-top:6px;color:#666;">sessionId: \${escapeHtml(run.sessionId)}</div>
            <div style="color:#666;">mode: \${escapeHtml(run.selectedMode?.id || "-")}</div>
            <div style="color:#666;">fixIterations: \${run.fixIterations || 0}</div>

            <div style="margin-top:12px;padding:8px;background:#f9f9f9;border-radius:4px;">
              <strong>Jobs</strong>
              \${jobsHtml}
            </div>

            <div style="margin-top:12px;padding:8px;background:#f9f9f9;border-radius:4px;">
              <strong>Artifacts</strong>
              \${artifactsHtml}
            </div>

            <div style="margin-top:12px;padding:8px;background:#e3f2fd;border-radius:4px;">
              <strong>🔧 Models (Telemetry)</strong>
              \${telemetryHtml}
            </div>

            <div style="margin-top:12px;padding:8px;background:\${currentRollbackAvailable ? "#e8f5e9" : "#ffebee"};border-radius:4px;">
              <strong>Rollback</strong><br/>
              available: <code>\${currentRollbackAvailable}</code> — allowWrite: <code>\${currentPolicy.allowWrite}</code>
              \${currentRollbackAvailable ? "" : " — (no .mcp/backups/&lt;runId&gt;/ found)"}<br/>
              status: <code>\${escapeHtml(cooldownStatus)}</code>
            </div>
            <div style="margin-top:8px;color:#666;">last rollback:</div>
            <pre style="background:#fff;padding:8px;border-radius:4px;font-size:12px;max-height:120px;overflow:auto;">\${escapeHtml(lastRb)}</pre>
            <div style="margin-top:8px;color:#666;">history:</div>
            <pre style="background:#fff;padding:8px;border-radius:4px;font-size:11px;max-height:150px;overflow:auto;">\${escapeHtml(hist || "(empty)")}</pre>
          \`;
        } catch (e) {
          runDetails.innerHTML = "<span style='color:#c30;'>Error loading run: " + escapeHtml(String(e)) + "</span>";
        }
      }

      refreshRunsBtn.onclick = loadRuns;
      runsList.onchange = () => {
        if (runsList.value) loadRunDetails(runsList.value);
      };

      exportRunBtn.onclick = () => {
        if (currentRunId) {
          window.open("/api/runs/" + encodeURIComponent(currentRunId) + "/export", "_blank");
        }
      };

      replayBtn.onclick = async () => {
        if (!currentRunId) return;
        replayBtn.disabled = true;
        try {
          const res = await fetch("/api/runs/" + encodeURIComponent(currentRunId) + "/replay-dry-run", { method: "POST" });
          const data = await res.json();
          alert("Replay dry-run OK.\\n" + JSON.stringify(data.summary || data, null, 2));
        } catch (e) {
          alert("Replay failed: " + e);
        } finally {
          replayBtn.disabled = false;
        }
      };

      rollbackBtn.onclick = async () => {
        if (!currentRunId) return;
        const ok = confirm("Rollback workspace from .mcp/backups/" + currentRunId + " ?\\nThis will overwrite files in your repo.\\n\\nIf you just rolled back, there is a cooldown.");
        if (!ok) return;
        rollbackBtn.disabled = true;
        try {
          const res = await fetch("/api/runs/" + encodeURIComponent(currentRunId) + "/rollback", { method: "POST" });
          const data = await res.json();
          if (data.ok) {
            alert("Rollback OK.\\nRestored " + (data.result?.restoredCount || 0) + " files.");
            loadRunDetails(currentRunId);
          } else if (data.error === "ALREADY_ROLLED_BACK") {
            // 11.5: handle 409 cooldown
            alert("Rollback blocked: already rolled back recently (cooldown).\\nOpen the Run details to see timing.");
            loadRunDetails(currentRunId);
          } else {
            alert("Rollback failed: " + (data.message || JSON.stringify(data)));
          }
        } catch (e) {
          alert("Rollback failed: " + e);
        } finally {
          rollbackBtn.disabled = false;
        }
      };

      loadRuns();

      // --- 12.7: Modes Registry UI ---
      const modesTbody = document.getElementById("modesTbody");
      const modeDetails = document.getElementById("modeDetails");
      const refreshModesBtn = document.getElementById("refreshModesBtn");
      const modesSearch = document.getElementById("modesSearch");
      let allModes = [];

      function statusBadge(status) {
        const colors = { OK: "#0a7", INVALID: "#c30", CYCLE: "#c30", SCHEMA_MISMATCH: "#f90" };
        const bg = colors[status] || "#999";
        return '<span style="background:' + bg + ';color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;">' + status + '</span>';
      }

      async function loadModes() {
        try {
          const res = await fetch("/api/modes");
          allModes = await res.json();
          renderModes();
        } catch (e) {
          modesTbody.innerHTML = '<tr><td colspan="5" class="err">Failed to load modes</td></tr>';
        }
      }

      function renderModes() {
        const q = (modesSearch.value || "").toLowerCase();
        const filtered = allModes.filter(m =>
          !q || (m.id || "").toLowerCase().includes(q) || (m.name || "").toLowerCase().includes(q) || (m.tags || []).some(t => t.toLowerCase().includes(q))
        );
        if (filtered.length === 0) {
          modesTbody.innerHTML = '<tr><td colspan="5" class="muted">No modes found</td></tr>';
          return;
        }
        modesTbody.innerHTML = filtered.map(m => {
          const srcBadge = m.source ? '<span style="background:#666;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;margin-left:4px;">' + m.source + '</span>' : '';
          const packBadge = m.pack ? '<span style="background:#369;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;margin-left:4px;">' + esc(m.pack.id) + (m.pack.version ? '@' + esc(m.pack.version) : '') + '</span>' : '';
          return '<tr>' +
          '<td class="mono">' + esc(m.id) + '</td>' +
          '<td>' + esc(m.name || "-") + '</td>' +
          '<td class="mono">' + (m.nodeCount ?? 0) + '</td>' +
          '<td>' + statusBadge(m.status) + srcBadge + packBadge + '</td>' +
          '<td>' +
            '<button onclick="viewMode(\\'' + m.id + '\\')">View</button> ' +
            '<button onclick="simulateMode(\\'' + m.id + '\\')">Simulate</button>' +
          '</td>' +
          '</tr>';
        }).join("");
      }

      window.viewMode = async function(id) {
        try {
          const res = await fetch("/api/modes/" + encodeURIComponent(id));
          const detail = await res.json();
          let html = '<strong>Mode: ' + esc(detail.id) + '</strong><br>';
          html += '<span class="muted">Name:</span> ' + esc(detail.name || "-") + '<br>';
          html += '<span class="muted">Status:</span> ' + statusBadge(detail.status);
          if (detail.source) html += ' <span style="background:#666;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;">' + detail.source + '</span>';
          if (detail.pack) html += ' <span style="background:#369;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;">' + esc(detail.pack.id) + (detail.pack.version ? '@' + esc(detail.pack.version) : '') + '</span>';
          html += '<br>';
          if (detail.errors && detail.errors.length > 0) {
            html += '<br><strong style="color:#c30;">Errors:</strong><ul>';
            detail.errors.forEach(e => { html += '<li>' + esc(e.type) + ': ' + esc(e.message) + '</li>'; });
            html += '</ul>';
          }
          if (detail.nodes && detail.nodes.length > 0) {
            html += '<br><strong>Nodes:</strong><table style="margin-top:4px;font-size:12px;">';
            html += '<tr><th>id</th><th>role</th><th>schema</th></tr>';
            detail.nodes.forEach(n => {
              html += '<tr><td class="mono">' + esc(n.id) + '</td><td>' + esc(n.role) + '</td><td class="mono">' + esc(n.expectedSchema) + '</td></tr>';
            });
            html += '</table>';
          }
          if (detail.topo && detail.topo.length > 0) {
            html += '<br><strong>Execution Order (topo):</strong><ol style="margin:4px 0;">';
            detail.topo.forEach((tick, i) => {
              const parallel = tick.length > 1 ? ' <span style="color:#0a7;">(parallel)</span>' : '';
              html += '<li>Tick ' + (i+1) + ': <code>' + tick.join(", ") + '</code>' + parallel + '</li>';
            });
            html += '</ol>';
          }
          modeDetails.innerHTML = html;
        } catch (e) {
          modeDetails.innerHTML = '<span class="err">Failed to load mode: ' + e + '</span>';
        }
      };

      window.simulateMode = async function(id) {
        try {
          const res = await fetch("/api/modes/" + encodeURIComponent(id) + "/simulate", { method: "POST" });
          const sim = await res.json();
          let html = '<strong>Simulate: ' + esc(id) + '</strong><br>';
          if (!sim.ok) {
            html += '<span class="err">Error: ' + esc(sim.error) + '</span>';
          } else {
            html += '<br><strong>Execution Ticks:</strong><ol style="margin:4px 0;">';
            sim.ticks.forEach((tick, i) => {
              const parallel = tick.length > 1 ? ' <span style="color:#0a7;">(parallel: ' + tick.length + ' nodes)</span>' : '';
              html += '<li>Tick ' + (i+1) + ': <code>' + tick.join(", ") + '</code>' + parallel + '</li>';
            });
            html += '</ol>';
            if (sim.parallel && sim.parallel.length > 0) {
              html += '<br><strong style="color:#0a7;">Parallel Groups:</strong> ' + sim.parallel.length + ' tick(s) with parallel execution';
            }
            if (Object.keys(sim.blockedBy || {}).length > 0) {
              html += '<br><br><strong>Dependencies (blockedBy):</strong><ul style="margin:4px 0;">';
              Object.entries(sim.blockedBy).forEach(([node, deps]) => {
                html += '<li><code>' + esc(node) + '</code> ← ' + (deps.length ? deps.map(d => '<code>' + esc(d) + '</code>').join(", ") : '(none)') + '</li>';
              });
              html += '</ul>';
            }
          }
          modeDetails.innerHTML = html;
        } catch (e) {
          modeDetails.innerHTML = '<span class="err">Simulate failed: ' + e + '</span>';
        }
      };

      refreshModesBtn.onclick = loadModes;
      modesSearch.oninput = renderModes;
      loadModes();

      // --- 13.2: Packs UI ---
      const packsTbody = document.getElementById("packsTbody");
      const refreshPacksBtn = document.getElementById("refreshPacksBtn");

      async function loadPacks() {
        try {
          const res = await fetch("/api/packs");
          const packs = await res.json();
          if (packs.length === 0) {
            packsTbody.innerHTML = '<tr><td colspan="5" class="muted">No packs found in .mcp/packs/</td></tr>';
            return;
          }
          packsTbody.innerHTML = packs.map(p => {
            const statusBadge = p.error
              ? '<span style="background:#c30;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;">INVALID</span>'
              : '<span style="background:#0a7;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;">OK</span>';
            return '<tr>' +
              '<td class="mono">' + esc(p.file) + '</td>' +
              '<td class="mono">' + esc(p.id || "") + '</td>' +
              '<td class="mono">' + esc(p.version || "") + '</td>' +
              '<td>' + esc(p.name || "-") + '</td>' +
              '<td>' + statusBadge + '</td>' +
              '</tr>';
          }).join("");
        } catch (e) {
          packsTbody.innerHTML = '<tr><td colspan="5" class="err">Failed to load packs</td></tr>';
        }
      }

      refreshPacksBtn.onclick = loadPacks;
      loadPacks();
    </script>
  </body>
</html>`;
}
export async function startDashboard(opts) {
    // 11.6: use policy value instead of hardcoded 300
    const rollbackCooldownSeconds = Math.max(0, Number(opts.policyPublic.rollbackCooldownSeconds ?? 300));
    const server = http.createServer(async (req, res) => {
        if (!req.url) {
            res.writeHead(400);
            res.end("bad request");
            return;
        }
        const u = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
        // --- MCP API Routes (PHASE 2) ---
        if (u.pathname.startsWith('/mcp/')) {
            const handled = await handleMcpRequest(u.pathname, req, res);
            if (handled)
                return;
        }
        // --- API Routes ---
        if (u.pathname === "/api/health") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true }));
            return;
        }
        if (u.pathname === "/api/policy") {
            res.writeHead(200, { "content-type": "application/json" });
            const { rollbackCooldownSeconds: _ignored, ...restPolicy } = opts.policyPublic;
            res.end(JSON.stringify({ workspaceRoot: opts.workspaceRoot, rollbackCooldownSeconds, ...restPolicy }, null, 2));
            return;
        }
        if (u.pathname === "/api/events") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ events: opts.bus.getSnapshot() }, null, 2));
            return;
        }
        if (u.pathname === "/api/runs" && req.method === "GET") {
            try {
                const items = await listRuns(opts.workspaceRoot);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ runs: items }, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const runMatch = u.pathname.match(/^\/api\/runs\/([^/]+)$/);
        if (runMatch && req.method === "GET") {
            const runId = runMatch[1];
            try {
                const run = await loadRun(opts.workspaceRoot, runId);
                let bundle = null;
                try {
                    bundle = await loadBundleForSession(opts.workspaceRoot, run.sessionId);
                }
                catch {
                    bundle = null;
                }
                const rollbackAvailable = await hasBackup(opts.workspaceRoot, runId);
                // 11.5: cooldown state for UI
                const lastRollbackTs = run.rollback?.ts ?? null;
                const lastRollbackAgeSec = lastRollbackTs
                    ? Math.floor((Date.now() - new Date(lastRollbackTs).getTime()) / 1000)
                    : null;
                const rollbackInCooldown = typeof lastRollbackAgeSec === "number" && lastRollbackAgeSec >= 0 && lastRollbackAgeSec < rollbackCooldownSeconds;
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ run, bundle, rollbackAvailable, rollbackCooldownSeconds, rollbackInCooldown, lastRollbackAgeSec }, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "RUN_NOT_FOUND", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // 12.5: Timeline endpoint
        const timelineMatch = u.pathname.match(/^\/api\/runs\/([^/]+)\/timeline$/);
        if (timelineMatch && req.method === "GET") {
            const runId = timelineMatch[1];
            try {
                const run = await loadRun(opts.workspaceRoot, runId);
                const { buildJobsTimeline } = await import("./data/timeline.js");
                const tl = buildJobsTimeline(run);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(tl, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "TIMELINE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const exportMatch = u.pathname.match(/^\/api\/runs\/([^/]+)\/export$/);
        if (exportMatch && req.method === "GET") {
            const runId = exportMatch[1];
            try {
                const payload = await exportRunJSON(opts.workspaceRoot, runId);
                res.writeHead(200, {
                    "content-type": "application/json",
                    "content-disposition": `attachment; filename="run-${runId}.json"`,
                });
                res.end(JSON.stringify(payload, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "EXPORT_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const rollbackMatch = u.pathname.match(/^\/api\/runs\/([^/]+)\/rollback$/);
        if (rollbackMatch && req.method === "POST") {
            const runId = rollbackMatch[1];
            const policy = PolicySchema.parse({
                workspaceRoot: opts.workspaceRoot,
                allowWrite: opts.policyPublic.allowWrite,
                allowedWritePaths: opts.policyPublic.allowedWritePaths,
                blockedWritePaths: opts.policyPublic.blockedWritePaths,
            });
            if (!policy.allowWrite) {
                res.writeHead(403, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "POLICY_BLOCK", message: "allowWrite=false" }, null, 2));
                return;
            }
            // 11.5: cooldown gate server-side
            try {
                const existingRun = await loadRun(opts.workspaceRoot, runId);
                const ts = existingRun.rollback?.ts;
                if (ts) {
                    const ageSec = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
                    if (ageSec >= 0 && ageSec < rollbackCooldownSeconds) {
                        res.writeHead(409, { "content-type": "application/json" });
                        res.end(JSON.stringify({
                            error: "ALREADY_ROLLED_BACK",
                            message: `Rollback cooldown active (${rollbackCooldownSeconds}s). Try again later.`,
                            rollbackCooldownSeconds,
                            lastRollbackTs: ts,
                            lastRollbackAgeSec: ageSec,
                        }, null, 2));
                        return;
                    }
                }
            }
            catch { /* run not found, continue */ }
            const backupExists = await hasBackup(opts.workspaceRoot, runId);
            if (!backupExists) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "NO_BACKUP", message: "No backup folder for runId" }, null, 2));
                return;
            }
            try {
                const result = await rollbackWorkspace({ workspaceRoot: opts.workspaceRoot, policy, runId });
                const now = new Date().toISOString();
                const run = await loadRun(opts.workspaceRoot, runId);
                const updatedRun = {
                    ...run,
                    updatedAt: now,
                    rollback: {
                        ts: now,
                        kind: "manual",
                        ok: true,
                        runId,
                        restoredCount: result.restoredCount,
                        restored: result.restored,
                    },
                    history: [
                        ...run.history,
                        { ts: now, from: run.state, to: run.state, note: "manual rollback (dashboard)" },
                    ],
                };
                await saveRun(opts.workspaceRoot, updatedRun);
                try {
                    const ev = { ts: now, type: "rollback", source: "dashboard", runId, ok: true, restoredCount: result.restoredCount };
                    opts.bus.getSnapshot().push(ev);
                }
                catch { /* ignore */ }
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, result }, null, 2));
            }
            catch (e) {
                try {
                    const now = new Date().toISOString();
                    const run = await loadRun(opts.workspaceRoot, runId);
                    const updatedRun = {
                        ...run,
                        updatedAt: now,
                        rollback: {
                            ts: now,
                            kind: "manual",
                            ok: false,
                            runId,
                            message: e instanceof Error ? e.message : String(e),
                        },
                        history: [
                            ...run.history,
                            { ts: now, from: run.state, to: run.state, note: "manual rollback failed (dashboard)" },
                        ],
                    };
                    await saveRun(opts.workspaceRoot, updatedRun);
                }
                catch { /* ignore */ }
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "ROLLBACK_FAILED", message: e instanceof Error ? e.message : String(e) }, null, 2));
            }
            return;
        }
        const replayMatch = u.pathname.match(/^\/api\/runs\/([^/]+)\/replay-dry-run$/);
        if (replayMatch && req.method === "POST") {
            const runId = replayMatch[1];
            try {
                const report = await replayDryRun(opts.workspaceRoot, opts.policyPublic, runId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(report, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "REPLAY_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (u.pathname === "/api/runs/import" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = Buffer.concat(chunks).toString("utf8");
                    const json = JSON.parse(body);
                    const result = await importRunJSON(opts.workspaceRoot, json);
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify(result, null, 2));
                }
                catch (e) {
                    res.writeHead(400, { "content-type": "application/json" });
                    res.end(JSON.stringify({ error: "IMPORT_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        if (u.pathname === "/api/stats" && req.method === "GET") {
            const range = u.searchParams.get("range") ?? "all";
            try {
                const stats = await computeStats(opts.workspaceRoot, range);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(stats, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "STATS_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (u.pathname === "/api/replays" && req.method === "GET") {
            try {
                const items = await listReplays(opts.workspaceRoot);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ replays: items }, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (u.pathname === "/api/replays/batch/latest-done" && req.method === "POST") {
            const limit = Number(u.searchParams.get("limit") ?? "10");
            try {
                const result = await replayLatestDoneRuns(opts.workspaceRoot, opts.policyPublic, limit);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "BATCH_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const replayGetMatch = u.pathname.match(/^\/api\/replays\/([^/]+)$/);
        if (replayGetMatch && req.method === "GET") {
            const runId = replayGetMatch[1];
            try {
                const replay = await loadReplay(opts.workspaceRoot, runId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ replay }, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "REPLAY_NOT_FOUND", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const replayCompareMatch = u.pathname.match(/^\/api\/replays\/([^/]+)\/compare$/);
        if (replayCompareMatch && req.method === "GET") {
            const runId = replayCompareMatch[1];
            try {
                const cmp = await compareRunToReplay(opts.workspaceRoot, runId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(cmp, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "COMPARE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const replayDlMatch = u.pathname.match(/^\/api\/replays\/([^/]+)\/download$/);
        if (replayDlMatch && req.method === "GET") {
            const runId = replayDlMatch[1];
            try {
                const payload = await downloadReplayJSON(opts.workspaceRoot, runId);
                res.writeHead(200, {
                    "content-type": "application/json",
                    "content-disposition": `attachment; filename="replay-${runId}.json"`,
                });
                res.end(JSON.stringify(payload, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "REPLAY_NOT_FOUND", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 12.7: Modes Registry API ---
        const modesPath = path.join(opts.workspaceRoot, "modes");
        const registry = new ModesRegistry({ modesPath });
        if (u.pathname === "/api/modes" && req.method === "GET") {
            try {
                const list = await registry.list();
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(list, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "MODES_LIST_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const modeGetMatch = u.pathname.match(/^\/api\/modes\/([^/]+)$/);
        if (modeGetMatch && req.method === "GET") {
            const modeId = modeGetMatch[1];
            try {
                const detail = await registry.get(modeId);
                if (!detail) {
                    res.writeHead(404, { "content-type": "application/json" });
                    res.end(JSON.stringify({ error: "MODE_NOT_FOUND", modeId }));
                    return;
                }
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(detail, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "MODE_GET_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const modeValidateMatch = u.pathname.match(/^\/api\/modes\/([^/]+)\/validate$/);
        if (modeValidateMatch && req.method === "POST") {
            const modeId = modeValidateMatch[1];
            try {
                const result = await registry.validate(modeId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "VALIDATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        const modeSimulateMatch = u.pathname.match(/^\/api\/modes\/([^/]+)\/simulate$/);
        if (modeSimulateMatch && req.method === "POST") {
            const modeId = modeSimulateMatch[1];
            try {
                const result = await registry.simulate(modeId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "SIMULATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 13.2: Packs API ---
        if (u.pathname === "/api/packs" && req.method === "GET") {
            const packsDir = path.join(opts.workspaceRoot, ".mcp", "packs");
            try {
                let files = [];
                try {
                    files = (await fs.readdir(packsDir)).filter((f) => f.endsWith(".json"));
                }
                catch {
                    // No packs dir yet
                }
                const out = [];
                for (const f of files) {
                    try {
                        const raw = JSON.parse(await fs.readFile(path.join(packsDir, f), "utf-8"));
                        out.push({
                            file: f,
                            id: raw.pack?.id ?? "",
                            version: raw.pack?.version ?? "0.0.0",
                            name: raw.pack?.name ?? "",
                            enabled: raw.pack?.enabled ?? true,
                        });
                    }
                    catch (e) {
                        out.push({ file: f, error: String(e?.message ?? e) });
                    }
                }
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(out, null, 2));
            }
            catch (e) {
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "PACKS_LIST_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 20.1: Pack Ops (validate-all + simulate-all) ---
        if (u.pathname === "/api/reports/packops" && req.method === "GET") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, reports: listReports(opts.workspaceRoot, "packops") }, null, 2));
            return;
        }
        const packopsReportMatch = u.pathname.match(/^\/api\/reports\/packops\/([^/]+)$/);
        if (packopsReportMatch && req.method === "GET") {
            const id = packopsReportMatch[1];
            try {
                const report = loadReport(opts.workspaceRoot, "packops", id);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, report }, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "REPORT_NOT_FOUND", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if ((u.pathname === "/api/modes/validate-simulate-all" || u.pathname === "/api/packops/validate-simulate-all") && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const packId = String(body?.packId ?? "num-pack");
                    const prefix = String(body?.modePrefix ?? "num:");
                    const modesPath = path.join(opts.workspaceRoot, "modes");
                    const reg = new ModesRegistry({ modesPath });
                    const all = await reg.list();
                    const filtered = all.filter((m) => String(m.id).startsWith(prefix));
                    const ids = filtered.map((m) => String(m.id));
                    const r = await runPackOps({
                        root: opts.workspaceRoot,
                        packId,
                        modeIds: ids,
                        validateOne: async (id) => reg.validate(id),
                        simulateOne: async (id) => reg.simulate(id),
                        importResult: body?.importResult,
                    });
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: true, ...r }, null, 2));
                }
                catch (e) {
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "PACKOPS_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        // --- 20.2: Smoke runs ---
        if (u.pathname === "/api/reports/smoke" && req.method === "GET") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, reports: listReports(opts.workspaceRoot, "smoke") }, null, 2));
            return;
        }
        const smokeReportMatch = u.pathname.match(/^\/api\/reports\/smoke\/([^/]+)$/);
        if (smokeReportMatch && req.method === "GET") {
            const id = smokeReportMatch[1];
            try {
                const report = loadReport(opts.workspaceRoot, "smoke", id);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, report }, null, 2));
            }
            catch (e) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "REPORT_NOT_FOUND", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (u.pathname === "/api/smoke/start" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const input = {
                        packId: String(body?.packId ?? "num-pack"),
                        sample: Number(body?.sample ?? 10),
                        strategy: body?.strategy ?? "core+chefs",
                        tags: body?.tags,
                        autoApply: !!body?.autoApply,
                        dryRun: body?.dryRun !== false, // default true for safety
                        modePrefix: body?.modePrefix ?? "num:",
                    };
                    const modesPath = path.join(opts.workspaceRoot, "modes");
                    const reg = new ModesRegistry({ modesPath });
                    const all = await reg.list();
                    const allModes = all.map((m) => ({ id: String(m.id), tags: m.tags ?? [] }));
                    const r = await runSmoke({
                        root: opts.workspaceRoot,
                        input: input,
                        allModes,
                        validateOne: async (id) => reg.validate(id),
                        simulateOne: async (id) => reg.simulate(id),
                        // runOne not wired yet - smoke dry-run only
                    });
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: true, ...r }, null, 2));
                }
                catch (e) {
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "SMOKE_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        // --- 19.4: Model Health API ---
        if (u.pathname === "/api/model-health" && req.method === "GET") {
            const range = u.searchParams.get("range") ?? "7d";
            const events = loadTelemetryEvents(opts.workspaceRoot);
            const report = computeModelHealthFromEvents(events, range);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, report }, null, 2));
            return;
        }
        if (u.pathname === "/api/model-health/suggestions" && req.method === "GET") {
            const range = u.searchParams.get("range") ?? "7d";
            const minCalls = Number(u.searchParams.get("minCalls") ?? "20");
            const events = loadTelemetryEvents(opts.workspaceRoot);
            const report = computeModelHealthFromEvents(events, range);
            const suggestions = suggestFallbacks(report, minCalls);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, range, minCalls, suggestions }, null, 2));
            return;
        }
        if (u.pathname === "/api/model-health/apply-suggestion" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const result = applyModelFallbackSuggestion(opts.workspaceRoot, body);
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: true, result }, null, 2));
                }
                catch (e) {
                    res.writeHead(400, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "APPLY_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        if (u.pathname === "/api/reports/model-health" && req.method === "GET") {
            const list = listModelHealthReports(opts.workspaceRoot);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, reports: list }, null, 2));
            return;
        }
        const mhReportMatch = u.pathname.match(/^\/api\/reports\/model-health\/([^/]+)$/);
        if (mhReportMatch && req.method === "GET") {
            const id = mhReportMatch[1];
            const rep = loadModelHealthReport(opts.workspaceRoot, id);
            if (!rep) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "REPORT_NOT_FOUND" }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, report: rep }, null, 2));
            return;
        }
        // --- 19.4.3: Batch apply top N suggestions ---
        if (u.pathname === "/api/model-health/batch-apply" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const result = runBatchApply(opts.workspaceRoot, body);
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: true, result }, null, 2));
                }
                catch (e) {
                    res.writeHead(400, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "BATCH_APPLY_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        if (u.pathname === "/api/reports/model-health-batch" && req.method === "GET") {
            const list = listModelHealthBatchReports(opts.workspaceRoot);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, reports: list }, null, 2));
            return;
        }
        const mhBatchReportMatch = u.pathname.match(/^\/api\/reports\/model-health-batch\/([^/]+)$/);
        if (mhBatchReportMatch && req.method === "GET") {
            const id = mhBatchReportMatch[1];
            const rep = loadModelHealthBatchReport(opts.workspaceRoot, id);
            if (!rep) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "BATCH_REPORT_NOT_FOUND" }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, report: rep }, null, 2));
            return;
        }
        // --- 19.4.4: Git batch ops (branch + commit + bundle) ---
        if (u.pathname === "/api/model-health/git-ops" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    if (!opts.policyPublic.allowGit) {
                        res.writeHead(403, { "content-type": "application/json" });
                        res.end(JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowGit=false blocks git operations" }));
                        return;
                    }
                    const result = runGitBatchOps({
                        workspaceRoot: opts.workspaceRoot,
                        ...body,
                    });
                    res.writeHead(result.ok ? 200 : 400, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: result.ok, result }, null, 2));
                }
                catch (e) {
                    res.writeHead(400, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "GIT_OPS_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        // --- 20.3: Catalog API ---
        if (u.pathname === "/api/catalog" && req.method === "GET") {
            const packId = u.searchParams.get("packId") ?? "num-pack";
            const packOutDir = path.join(opts.workspaceRoot, "packs", packId);
            const catalog = loadCatalog(packOutDir);
            if (!catalog) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "CATALOG_NOT_FOUND", packId }));
                return;
            }
            // Add custom modes from custom_modes.d/ as additional agents
            try {
                const fsSync = require('fs');
                const customModesDir = path.join(opts.workspaceRoot, "custom_modes.d");
                const customModes = [];
                if (fsSync.existsSync(customModesDir)) {
                    const files = fsSync.readdirSync(customModesDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
                    for (const file of files) {
                        try {
                            const content = fsSync.readFileSync(path.join(customModesDir, file), 'utf-8');
                            const yamlContent = content.match(/customModes:\s*\n([\s\S]*)/);
                            if (yamlContent) {
                                // Parse YAML manually (simple extraction)
                                const lines = yamlContent[1].split('\n');
                                let currentMode = null;
                                for (const line of lines) {
                                    if (line.match(/^\s*-\s+slug:/)) {
                                        if (currentMode)
                                            customModes.push(currentMode);
                                        currentMode = { id: '', name: '', tags: [], capabilities: [], isChef: false, isStub: false };
                                    }
                                    const slugMatch = line.match(/slug:\s*(.+)/);
                                    if (slugMatch && currentMode)
                                        currentMode.id = slugMatch[1].trim();
                                    const nameMatch = line.match(/name:\s*(.+)/);
                                    if (nameMatch && currentMode)
                                        currentMode.name = nameMatch[1].trim();
                                }
                                if (currentMode)
                                    customModes.push(currentMode);
                            }
                        }
                        catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
                // Merge custom modes with catalog modes
                if (customModes.length > 0 && catalog.modes) {
                    catalog.modes = [...catalog.modes, ...customModes];
                    catalog.stats.total = catalog.modes.length;
                }
            }
            catch (e) {
                // Ignore errors loading custom modes
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, catalog }, null, 2));
            return;
        }
        // --- API: Custom Modes YAML ---
        if (u.pathname === "/api/custom-modes" && req.method === "GET") {
            const customModesDir = path.join(opts.workspaceRoot, "custom_modes.d");
            const customModes = loadCustomModes(customModesDir);
            const stats = getCustomModesStats(customModes);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, modes: customModes, stats }, null, 2));
            return;
        }
        // --- API: MCP Tools ---
        if (u.pathname === "/api/mcp/tools" && req.method === "GET") {
            const category = u.searchParams.get("category");
            const tools = category ? getToolsByCategory(category) : MCP_TOOLS;
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, tools, categories: getAllCategories() }, null, 2));
            return;
        }
        if (u.pathname === "/api/catalog/stats" && req.method === "GET") {
            const packId = u.searchParams.get("packId") ?? "num-pack";
            const packOutDir = path.join(opts.workspaceRoot, "packs", packId);
            const catalog = loadCatalog(packOutDir);
            if (!catalog) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "CATALOG_NOT_FOUND", packId }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, packId, stats: catalog.stats }, null, 2));
            return;
        }
        if (u.pathname === "/api/catalog/rebuild" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const packId = String(body?.packId ?? "num-pack");
                    const modesDir = path.join(opts.workspaceRoot, "modes", packId.replace("-pack", ""));
                    const packOutDir = path.join(opts.workspaceRoot, "packs", packId);
                    const { catalogPath, catalog } = writeCatalog({ packId, modesDir, packOutDir });
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: true, catalogPath, stats: catalog.stats, count: catalog.count }, null, 2));
                }
                catch (e) {
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "CATALOG_REBUILD_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        const catalogModeMatch = u.pathname.match(/^\/api\/catalog\/mode\/([^/]+)$/);
        if (catalogModeMatch && req.method === "GET") {
            const modeId = decodeURIComponent(catalogModeMatch[1]);
            const packId = u.searchParams.get("packId") ?? "num-pack";
            const packOutDir = path.join(opts.workspaceRoot, "packs", packId);
            const catalog = loadCatalog(packOutDir);
            let mode = null;
            // First try catalog modes
            if (catalog && catalog.modes) {
                mode = catalog.modes.find((m) => m.id === modeId);
            }
            // If not found, try custom modes (for custom:* ids)
            if (!mode && modeId.startsWith("custom:")) {
                const customModesDir = path.join(opts.workspaceRoot, "custom_modes.d");
                const customModes = loadCustomModes(customModesDir);
                mode = customModes.find((m) => m.id === modeId);
            }
            if (!mode) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "MODE_NOT_IN_CATALOG", modeId }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, mode }, null, 2));
            return;
        }
        // --- 20.4: Marketplace Install API ---
        if (u.pathname === "/api/marketplace/install" && req.method === "POST") {
            const chunks = [];
            req.on("data", (c) => chunks.push(c));
            req.on("end", async () => {
                try {
                    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};
                    const bundlePath = String(body?.bundlePath ?? "");
                    const trustPolicyPath = body?.trustPolicyPath ? String(body.trustPolicyPath) : null;
                    if (!bundlePath) {
                        res.writeHead(400, { "content-type": "application/json" });
                        res.end(JSON.stringify({ ok: false, error: "MISSING_BUNDLE_PATH" }));
                        return;
                    }
                    const { verifyPackTrust } = await import("../server/marketplace/trust.js");
                    const { installPackFromBundle } = await import("../server/marketplace/install.js");
                    // Verify trust if policy provided
                    let trustResult = { trusted: true };
                    if (trustPolicyPath) {
                        trustResult = await verifyPackTrust({
                            bundlePath: path.resolve(opts.workspaceRoot, bundlePath),
                            trustPolicyPath: path.resolve(opts.workspaceRoot, trustPolicyPath),
                        });
                        if (!trustResult.trusted) {
                            res.writeHead(403, { "content-type": "application/json" });
                            res.end(JSON.stringify({ ok: false, error: "TRUST_REJECTED", reason: trustResult.reason, publisher: trustResult.publisher }));
                            return;
                        }
                    }
                    // Install pack
                    const installResult = await installPackFromBundle({
                        bundlePath: path.resolve(opts.workspaceRoot, bundlePath),
                        workspaceRoot: opts.workspaceRoot,
                    });
                    // Rebuild catalog after install
                    if (installResult.ok && installResult.packId) {
                        const modesDir = path.join(opts.workspaceRoot, "modes", installResult.packId.replace("-pack", ""));
                        const packOutDir = path.join(opts.workspaceRoot, "packs", installResult.packId);
                        writeCatalog({ packId: installResult.packId, modesDir, packOutDir });
                    }
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ...installResult, trust: trustResult }, null, 2));
                }
                catch (e) {
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "MARKETPLACE_INSTALL_FAILED", message: e instanceof Error ? e.message : String(e) }));
                }
            });
            return;
        }
        // --- UI ---
        if (u.pathname === "/model-health") {
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.end(modelHealthPage());
            return;
        }
        if (u.pathname === "/catalog") {
            try {
                const catalogTemplate = await fs.readFile(path.join(__dirname, "templates", "catalog.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(catalogTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Catalog template not found");
            }
            return;
        }
        if (u.pathname === "/packs") {
            try {
                const packsTemplate = await fs.readFile(path.join(__dirname, "templates", "packs.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(packsTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Packs template not found");
            }
            return;
        }
        if (u.pathname === "/agent") {
            try {
                const agentTemplate = await fs.readFile(path.join(__dirname, "templates", "agent-detail.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(agentTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Agent template not found");
            }
            return;
        }
        if (u.pathname === "/editor") {
            try {
                const editorTemplate = await fs.readFile(path.join(__dirname, "templates", "editor.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(editorTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Editor template not found");
            }
            return;
        }
        if (u.pathname === "/playground") {
            try {
                const playgroundTemplate = await fs.readFile(path.join(__dirname, "templates", "playground.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(playgroundTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Playground template not found");
            }
            return;
        }
        if (u.pathname === "/scoring") {
            try {
                const scoringTemplate = await fs.readFile(path.join(__dirname, "templates", "scoring.html"), "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(scoringTemplate);
            }
            catch {
                res.writeHead(500, { "content-type": "text/plain" });
                res.end("Scoring template not found");
            }
            return;
        }
        if (u.pathname === "/" || u.pathname.startsWith("/?")) {
            const useModern = u.searchParams.get("theme") !== "legacy";
            const body = useModern ? await loadModernTemplate() : html();
            res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
            res.end(body);
            return;
        }
        // --- Pages: Catalog, Packs, Agent Detail, Editor, Playground, Scoring ---
        if (u.pathname === "/catalog") {
            try {
                const templatePath = path.join(__dirname, "templates", "catalog.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading catalog page</h1>");
                return;
            }
        }
        if (u.pathname === "/packs") {
            try {
                const templatePath = path.join(__dirname, "templates", "packs.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading packs page</h1>");
                return;
            }
        }
        if (u.pathname === "/agent-detail") {
            try {
                const templatePath = path.join(__dirname, "templates", "agent-detail.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading agent detail page</h1>");
                return;
            }
        }
        if (u.pathname === "/editor") {
            try {
                const templatePath = path.join(__dirname, "templates", "editor.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading editor page</h1>");
                return;
            }
        }
        if (u.pathname === "/playground") {
            try {
                const templatePath = path.join(__dirname, "templates", "playground.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading playground page</h1>");
                return;
            }
        }
        if (u.pathname === "/scoring") {
            try {
                const templatePath = path.join(__dirname, "templates", "scoring.html");
                const body = await fs.readFile(templatePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(body);
                return;
            }
            catch (e) {
                res.writeHead(500, { "content-type": "text/html" });
                res.end("<h1>Error loading scoring page</h1>");
                return;
            }
        }
        // --- 20.7: Agent Detail API ---
        if (req.method === "GET" && u.pathname.startsWith("/api/agent/")) {
            const modeId = decodeURIComponent(u.pathname.replace("/api/agent/", ""));
            const detail = await getAgentDetail(registry, modeId);
            if (!detail) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "AGENT_NOT_FOUND" }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, agent: detail }, null, 2));
            return;
        }
        if (req.method === "GET" && u.pathname.startsWith("/api/agent/") && u.pathname.includes("/runs")) {
            const parts = u.pathname.split("/");
            const modeId = decodeURIComponent(parts[3] || "");
            const limit = parseInt(u.searchParams.get("limit") || "5", 10);
            const runs = getAgentRuns(opts.workspaceRoot, modeId, limit);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, runs }, null, 2));
            return;
        }
        if (req.method === "GET" && u.pathname.startsWith("/api/agent/") && u.pathname.includes("/health")) {
            const parts = u.pathname.split("/");
            const modeId = decodeURIComponent(parts[3] || "");
            const health = getAgentHealth(opts.workspaceRoot, modeId);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, health }, null, 2));
            return;
        }
        // --- 20.8: Editor API ---
        if (req.method === "POST" && u.pathname === "/api/editor/create") {
            const body = await readBody(req);
            const slug = body.slug || "";
            const name = body.name || "";
            try {
                if (!opts.policyPublic.allowWrite) {
                    res.writeHead(403, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowWrite=false" }));
                    return;
                }
                const outModesDir = path.join(opts.workspaceRoot, "modes", "num");
                const result = createMode(opts.workspaceRoot, outModesDir, slug, name);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, ...result }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "CREATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/editor/duplicate") {
            const body = await readBody(req);
            const fromModeId = body.fromModeId || "";
            const slug = body.slug || "";
            const name = body.name || "";
            try {
                if (!opts.policyPublic.allowWrite) {
                    res.writeHead(403, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowWrite=false" }));
                    return;
                }
                const from = await openMode(registry, fromModeId);
                if (!from) {
                    res.writeHead(404, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "SOURCE_NOT_FOUND" }));
                    return;
                }
                const outModesDir = path.join(opts.workspaceRoot, "modes", "num");
                const result = duplicateMode(opts.workspaceRoot, outModesDir, from, slug, name);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, ...result }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "DUPLICATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/editor/open") {
            const body = await readBody(req);
            const modeId = body.modeId || "";
            const mode = await openMode(registry, modeId);
            if (!mode) {
                res.writeHead(404, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "MODE_NOT_FOUND" }));
                return;
            }
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, mode }, null, 2));
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/editor/save") {
            const body = await readBody(req);
            const modeId = body.modeId || "";
            const mode = body.mode;
            try {
                if (!opts.policyPublic.allowWrite) {
                    res.writeHead(403, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "POLICY_BLOCK", message: "allowWrite=false" }));
                    return;
                }
                const outModesDir = path.join(opts.workspaceRoot, "modes", "num");
                const result = writeMode(opts.workspaceRoot, outModesDir, modeId, mode);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, saved: true, ...result }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "SAVE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/editor/validate") {
            const body = await readBody(req);
            const modeId = body.modeId || "";
            try {
                const result = await validateMode(registry, modeId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: result.ok, result: result.result || result.error }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "VALIDATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/editor/simulate") {
            const body = await readBody(req);
            const modeId = body.modeId || "";
            try {
                const result = await simulateMode(registry, modeId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: result.ok, result: result.result || result.error }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "SIMULATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 20.9: Playground API ---
        if (req.method === "POST" && u.pathname === "/api/playground/simulate") {
            const body = await readBody(req);
            const modeId = body.modeId || "";
            try {
                const result = await simulateMode(registry, modeId);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: result.ok, result: result.result || result.error }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "SIMULATE_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 21.0: Scoring API ---
        if (req.method === "GET" && u.pathname === "/api/scoring") {
            const range = u.searchParams.get("range") || "7d";
            const tag = u.searchParams.get("tag") || "";
            const q = u.searchParams.get("q") || "";
            const items = computeScoring(opts.workspaceRoot, range, q, tag);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, items }, null, 2));
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/scoring/suggest") {
            const body = await readBody(req);
            const goal = body.goal || "";
            const items = computeScoring(opts.workspaceRoot, "30d");
            const top = suggestAgents(items, goal);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, goal, items: top }, null, 2));
            return;
        }
        // --- 22.0: Marketplace API ---
        if (req.method === "POST" && u.pathname === "/api/marketplace/publish") {
            const body = await readBody(req);
            try {
                const result = publishPack(opts.workspaceRoot, body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "PUBLISH_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/marketplace/install") {
            const body = await readBody(req);
            try {
                const result = installPack(opts.workspaceRoot, body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "INSTALL_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "GET" && u.pathname === "/api/marketplace/list") {
            try {
                const packs = listMarketplacePacks(opts.workspaceRoot);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, packs }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "LIST_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 22.2: Performance API (Cache + Index) ---
        if (req.method === "GET" && u.pathname === "/api/performance/cache/stats") {
            const cache = new CacheManager();
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, stats: cache.stats() }, null, 2));
            return;
        }
        if (req.method === "GET" && u.pathname === "/api/performance/index/stats") {
            const index = new IndexManager(opts.workspaceRoot);
            index.load();
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, stats: index.stats() }, null, 2));
            return;
        }
        // --- 22.3: Security API (Audit + RBAC) ---
        if (req.method === "GET" && u.pathname === "/api/security/audit/logs") {
            const days = parseInt(u.searchParams.get("days") || "7", 10);
            const audit = new AuditLogger(opts.workspaceRoot);
            const logs = audit.getLogs(days);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, logs }, null, 2));
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/security/audit/log") {
            const body = await readBody(req);
            try {
                const audit = new AuditLogger(opts.workspaceRoot);
                const entry = audit.log(body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, entry }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "AUDIT_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "GET" && u.pathname === "/api/security/rbac/check") {
            const userId = u.searchParams.get("userId") || "";
            const permission = u.searchParams.get("permission") || "";
            const rbac = new RBACManager(opts.workspaceRoot);
            rbac.loadUsers();
            const allowed = rbac.hasPermission(userId, permission);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, userId, permission, allowed }, null, 2));
            return;
        }
        // --- 22.1: Advanced UI Features API ---
        if (req.method === "GET" && u.pathname.startsWith("/api/flowgraph/")) {
            const modeId = decodeURIComponent(u.pathname.replace("/api/flowgraph/", ""));
            try {
                const mode = await registry.get(modeId);
                if (!mode) {
                    res.writeHead(404, { "content-type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: "MODE_NOT_FOUND" }));
                    return;
                }
                const graph = generateFlowGraph(mode);
                const layoutGraph = calculateLayout(graph);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, graph: layoutGraph }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "FLOWGRAPH_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "GET" && u.pathname.startsWith("/api/flowgraph-svg/")) {
            const modeId = decodeURIComponent(u.pathname.replace("/api/flowgraph-svg/", ""));
            try {
                const mode = await registry.get(modeId);
                if (!mode) {
                    res.writeHead(404, { "content-type": "text/plain" });
                    res.end("MODE_NOT_FOUND");
                    return;
                }
                const graph = generateFlowGraph(mode);
                const svg = generateSVG(graph);
                res.writeHead(200, { "content-type": "image/svg+xml" });
                res.end(svg);
            }
            catch (e) {
                res.writeHead(400, { "content-type": "text/plain" });
                res.end("FLOWGRAPH_FAILED");
            }
            return;
        }
        if (req.method === "GET" && u.pathname === "/api/realtime/history") {
            const channel = u.searchParams.get("channel");
            const limit = parseInt(u.searchParams.get("limit") || "50", 10);
            const history = realtimeManager.getHistory(channel || undefined, limit);
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, events: history }, null, 2));
            return;
        }
        if (req.method === "GET" && u.pathname === "/api/realtime/channels") {
            const channels = realtimeManager.getChannels();
            const stats = channels.map((ch) => ({
                channel: ch,
                subscribers: realtimeManager.getSubscriberCount(ch),
            }));
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, channels: stats }, null, 2));
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/realtime/publish") {
            const body = await readBody(req);
            try {
                const channel = body.channel || "default";
                const event = body.event || { type: "custom", data: body.data };
                realtimeManager.publish(channel, event);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: true, published: true }, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "PUBLISH_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- 21.2: Advanced Features API ---
        if (req.method === "POST" && u.pathname === "/api/advanced/git-ops") {
            const body = await readBody(req);
            try {
                const result = executeGitOps(opts.workspaceRoot, body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "GIT_OPS_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/advanced/batch-op") {
            const body = await readBody(req);
            try {
                const result = executeBatchOp(opts.workspaceRoot, body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "BATCH_OP_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        if (req.method === "POST" && u.pathname === "/api/advanced/report") {
            const body = await readBody(req);
            try {
                const result = generateReport(opts.workspaceRoot, body);
                res.writeHead(200, { "content-type": "application/json" });
                res.end(JSON.stringify(result, null, 2));
            }
            catch (e) {
                res.writeHead(400, { "content-type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "REPORT_FAILED", message: e instanceof Error ? e.message : String(e) }));
            }
            return;
        }
        // --- UI Pages: Custom Modes ---
        if (req.method === "GET" && u.pathname === "/custom-modes") {
            try {
                const filePath = path.join(__dirname, "pages", "custom-modes.html");
                const content = await fs.readFile(filePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(content);
            }
            catch (e) {
                res.writeHead(404, { "content-type": "text/plain" });
                res.end("custom-modes page not found");
            }
            return;
        }
        // --- UI Pages: Gemini Handlers ---
        if (req.method === "GET" && u.pathname === "/gemini-handlers") {
            try {
                const filePath = path.join(__dirname, "pages", "gemini-handlers.html");
                const content = await fs.readFile(filePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(content);
            }
            catch (e) {
                res.writeHead(404, { "content-type": "text/plain" });
                res.end("gemini-handlers page not found");
            }
            return;
        }
        // --- UI Pages: Flow Visualizer ---
        if (req.method === "GET" && u.pathname === "/flow-visualizer") {
            try {
                const filePath = path.join(__dirname, "pages", "flow-visualizer.html");
                const content = await fs.readFile(filePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(content);
            }
            catch (e) {
                res.writeHead(404, { "content-type": "text/plain" });
                res.end("flow-visualizer page not found");
            }
            return;
        }
        // --- API: Handler Selector Component ---
        if (req.method === "GET" && u.pathname === "/api/components/handler-selector") {
            try {
                const filePath = path.join(__dirname, "components", "handler-selector.html");
                const content = await fs.readFile(filePath, "utf-8");
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(content);
            }
            catch (e) {
                res.writeHead(404, { "content-type": "text/plain" });
                res.end("handler-selector component not found");
            }
            return;
        }
        // --- API: Gemini Handlers Info ---
        if (req.method === "GET" && u.pathname === "/api/gemini/handlers") {
            const handlers = [
                { name: "LLMHandler", description: "Multi-provider LLM support", status: "active" },
                { name: "FunctionCallingHandler", description: "Function calling orchestration", status: "active" },
                { name: "ComputerUseHandler", description: "Browser automation & UI control", status: "active" },
                { name: "BatchProcessingHandler", description: "Async batch job management", status: "active" },
                { name: "CachingTokensHandler", description: "Context caching & token management", status: "active" },
                { name: "LongContextHandler", description: "1M+ token context support", status: "active" },
                { name: "EmbeddingsRAGHandler", description: "Embeddings & RAG system", status: "active" },
                { name: "DeepResearchAgentHandler", description: "Multi-step research agent", status: "active" },
                { name: "GeminiConfigManager", description: "Configuration management", status: "active" },
            ];
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, handlers, total: handlers.length }, null, 2));
            return;
        }
        // --- API: Flow Status ---
        if (req.method === "GET" && u.pathname === "/api/flow/status") {
            const status = {
                phases: [
                    { name: "Analysis", agent: "analysis-agent", status: "ready", handlers: 3 },
                    { name: "Planning", agent: "planning-agent", status: "ready", handlers: 3 },
                    { name: "Solutioning", agent: "solutioning-agent", status: "ready", handlers: 4 },
                    { name: "Implementation", agent: "implementation-agent", status: "ready", handlers: 4 },
                ],
                totalAgents: 28,
                totalHandlers: 9,
                coverage: "100%",
            };
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ ok: true, flow: status }, null, 2));
            return;
        }
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("not found");
    });
    const wss = new WebSocketServer({ noServer: true });
    server.on("upgrade", (req, socket, head) => {
        if (req.url !== "/ws") {
            socket.destroy();
            return;
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    });
    wss.on("connection", (ws) => {
        // Send snapshot on connect
        ws.send(JSON.stringify({ type: "snapshot", events: opts.bus.getSnapshot() }));
        // Subscribe to known events and forward full BaseEvent
        const names = [
            "runtime.started",
            "tool.called",
            "tool.succeeded",
            "tool.failed",
        ];
        const handlers = [];
        for (const n of names) {
            const fn = (ev) => {
                ws.send(JSON.stringify({ type: "event", event: ev }));
            };
            opts.bus.on(n, fn);
            handlers.push(() => opts.bus.off(n, fn));
        }
        ws.on("close", () => {
            for (const off of handlers)
                off();
        });
    });
    await new Promise((resolve) => server.listen(opts.port, "127.0.0.1", () => resolve()));
    const url = `http://127.0.0.1:${opts.port}/`;
    opts.log.info({ url }, "Dashboard listening");
    return { url };
}
