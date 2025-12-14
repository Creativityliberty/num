import { loadYamlFiles } from "./loader.js";
import { normalizeMode } from "./normalizer.js";
export class ModeRegistry {
    byId = new Map();
    all = [];
    static async fromPaths(paths) {
        const reg = new ModeRegistry();
        await reg.load(paths);
        return reg;
    }
    async load(paths) {
        const modes = [];
        for (const p of paths) {
            const files = await loadYamlFiles({ modesPath: p });
            for (const f of files) {
                const m = normalizeMode(f);
                if (m)
                    modes.push(m);
            }
        }
        // Dédup: dernier gagne (tu pourras faire mieux via aliases plus tard)
        this.byId.clear();
        for (const m of modes)
            this.byId.set(m.id, m);
        this.all = Array.from(this.byId.values()).sort((a, b) => a.id.localeCompare(b.id));
    }
    list(filter) {
        const q = filter?.query?.toLowerCase().trim();
        const tag = filter?.tag?.toLowerCase().trim();
        const category = filter?.category?.toLowerCase().trim();
        return this.all.filter((m) => {
            if (tag && !m.tags.some((t) => t.toLowerCase() === tag))
                return false;
            if (category) {
                const first = m.categoryPath?.[0]?.toLowerCase();
                if (first !== category)
                    return false;
            }
            if (!q)
                return true;
            const hay = [
                m.id,
                m.name,
                m.description ?? "",
                ...(m.tags ?? []),
                ...(m.categoryPath ?? []),
            ].join(" ").toLowerCase();
            return hay.includes(q);
        });
    }
    get(id) {
        return this.byId.get(id);
    }
    allModes() {
        return this.all;
    }
    count() {
        return this.all.length;
    }
}
