/**
 * Robust JSON extraction from common model outputs:
 * - ```json ... ```
 * - prose + JSON object
 */
export function extractLikelyJSON(text) {
    const t = text.trim();
    // fenced block
    const fence = t.match(/```json\s*([\s\S]*?)\s*```/i);
    if (fence?.[1])
        return fence[1].trim();
    // any fenced block
    const anyFence = t.match(/```\s*([\s\S]*?)\s*```/);
    if (anyFence?.[1])
        return anyFence[1].trim();
    // find first { and attempt to find matching }
    const start = t.indexOf("{");
    if (start < 0)
        return t;
    const s = t.slice(start);
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inStr) {
            if (esc)
                esc = false;
            else if (c === "\\")
                esc = true;
            else if (c === '"')
                inStr = false;
            continue;
        }
        if (c === '"')
            inStr = true;
        if (c === "{")
            depth++;
        if (c === "}")
            depth--;
        if (depth === 0)
            return s.slice(0, i + 1);
    }
    return s;
}
export function parseJSONStrict(text) {
    const raw = extractLikelyJSON(text);
    return JSON.parse(raw);
}
//# sourceMappingURL=json.js.map