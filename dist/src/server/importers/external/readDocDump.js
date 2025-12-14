import fs from "node:fs";
// This reader is deliberately tolerant:
// - If the file is JSON array/object -> parse that.
// - Else parse blocks like:
//   slug: ...
//   name: ...
//   groups: [a,b]
//   customInstructions: ...
export function readDocDump(inputPath) {
    const raw = fs.readFileSync(inputPath, "utf-8");
    const warnings = [];
    // 1) Try JSON
    try {
        const j = JSON.parse(raw);
        if (Array.isArray(j))
            return { agents: j.map(mapLoose), warnings };
        if (Array.isArray(j?.customModes))
            return { agents: j.customModes.map(mapLoose), warnings };
        if (j && typeof j === "object")
            return { agents: [mapLoose(j)], warnings };
    }
    catch {
        // fallthrough
    }
    // 2) Block parser
    const lines = raw.split(/\r?\n/);
    const agents = [];
    let cur = {};
    let collecting = false;
    let instrLines = [];
    const flush = () => {
        if (!cur.slug && !cur.name)
            return;
        if (instrLines.length)
            cur.customInstructions = instrLines.join("\n").trim();
        agents.push(mapLoose(cur));
        cur = {};
        instrLines = [];
        collecting = false;
    };
    for (const line of lines) {
        const m = line.match(/^(\w+)\s*:\s*(.*)$/);
        if (m) {
            const key = m[1];
            const val = m[2];
            if (key === "slug" && (cur.slug || cur.name))
                flush();
            if (key === "customInstructions") {
                collecting = true;
                instrLines = [val];
            }
            else {
                if (collecting) {
                    // encountering a new key ends collection
                    collecting = false;
                }
                cur[key] = val;
            }
            continue;
        }
        if (collecting)
            instrLines.push(line);
    }
    flush();
    if (!agents.length) {
        warnings.push({ kind: "DOC_EMPTY", message: "No agents parsed from doc dump", ref: inputPath });
    }
    return { agents, warnings };
}
function mapLoose(x) {
    const groups = parseGroups(x?.groups);
    return {
        slug: String(x?.slug ?? x?.id ?? x?.name ?? "").trim(),
        name: x?.name ? String(x.name) : undefined,
        description: x?.description ? String(x.description) : undefined,
        roleDefinition: x?.roleDefinition ? String(x.roleDefinition) : undefined,
        whenToUse: x?.whenToUse ? String(x.whenToUse) : undefined,
        groups,
        customInstructions: x?.customInstructions ? String(x.customInstructions) : undefined,
        source: x?.source ? String(x.source) : "docDump",
        version: x?.version ? String(x.version) : undefined,
    };
}
function parseGroups(v) {
    if (!v)
        return undefined;
    if (Array.isArray(v))
        return v.map(String);
    const s = String(v).trim();
    // handle "[a, b]" or "a,b"
    const cleaned = s.replace(/^\[|\]$/g, "");
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
    return parts.length ? parts : undefined;
}
