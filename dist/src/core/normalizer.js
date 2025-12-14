function asString(v) {
    return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}
function asRecord(v) {
    return v && typeof v === "object" && !Array.isArray(v) ? v : undefined;
}
function pushIf(out, v) {
    const s = asString(v);
    if (s)
        out.push(s);
}
/**
 * Normalise tes YAML Roo-like (slug/name/category/subcategory/roleDefinition/customInstructions)
 * vers un format universel.
 *
 * Exemple réel côté repo source:
 *  slug, name, category, subcategory, roleDefinition, customInstructions
 */
export function normalizeMode(file) {
    const rec = asRecord(file.doc);
    if (!rec)
        return null;
    const id = asString(rec.slug) ?? asString(rec.id);
    const name = asString(rec.name) ?? id;
    if (!id || !name)
        return null;
    const tags = [];
    pushIf(tags, rec.category);
    pushIf(tags, rec.subcategory);
    // Tu peux enrichir plus tard (ex: tags explicites si présents)
    const explicitTags = rec.tags;
    if (Array.isArray(explicitTags)) {
        for (const t of explicitTags)
            pushIf(tags, t);
    }
    const categoryPath = [];
    const cat = asString(rec.category);
    const sub = asString(rec.subcategory);
    if (cat)
        categoryPath.push(cat);
    if (sub)
        categoryPath.push(sub);
    const description = asString(rec.description) ??
        asString(rec.roleDefinition) ??
        undefined;
    // prompts: on range l'"identité/roleDefinition" plutôt en system,
    // et les longues règles (customInstructions) en developer.
    const system = asString(rec.roleDefinition) ?? undefined;
    const developer = asString(rec.customInstructions) ?? undefined;
    return {
        id,
        name,
        description,
        tags: Array.from(new Set(tags)).filter(Boolean),
        categoryPath: categoryPath.length ? categoryPath : undefined,
        prompts: { system, developer },
        source: { path: file.relPath, raw: file.doc },
    };
}
