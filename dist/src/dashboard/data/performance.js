import fs from "node:fs";
import path from "node:path";
export class CacheManager {
    cache = new Map();
    ttlMs;
    constructor(ttlSeconds = 300) {
        this.ttlMs = ttlSeconds * 1000;
    }
    set(key, value) {
        this.cache.set(key, {
            key,
            value,
            ttl: this.ttlMs,
            createdAt: Date.now(),
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        const age = Date.now() - entry.createdAt;
        if (age > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    clear() {
        this.cache.clear();
    }
    stats() {
        return {
            size: this.cache.size,
            ttlMs: this.ttlMs,
            entries: Array.from(this.cache.keys()),
        };
    }
}
export class IndexManager {
    index = new Map();
    root;
    constructor(root) {
        this.root = root;
    }
    add(entry) {
        this.index.set(entry.id, entry);
    }
    search(query) {
        const q = query.toLowerCase();
        return Array.from(this.index.values()).filter((e) => e.searchText.toLowerCase().includes(q));
    }
    searchByTag(tag) {
        const t = tag.toLowerCase();
        return Array.from(this.index.values()).filter((e) => e.tags.some((tag) => tag.toLowerCase().includes(t)));
    }
    save() {
        const indexPath = path.join(this.root, ".mcp", "index.json");
        const indexDir = path.dirname(indexPath);
        if (!fs.existsSync(indexDir))
            fs.mkdirSync(indexDir, { recursive: true });
        const data = Array.from(this.index.values());
        fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
    }
    load() {
        const indexPath = path.join(this.root, ".mcp", "index.json");
        if (!fs.existsSync(indexPath))
            return;
        try {
            const data = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
            for (const entry of data) {
                this.index.set(entry.id, entry);
            }
        }
        catch {
            // ignore
        }
    }
    stats() {
        return {
            size: this.index.size,
            entries: Array.from(this.index.keys()),
        };
    }
}
