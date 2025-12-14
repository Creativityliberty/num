import fs from "node:fs";
import path from "node:path";

export type CacheEntry = {
  key: string;
  value: Record<string, unknown>;
  ttl: number;
  createdAt: number;
};

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number = 300) {
    this.ttlMs = ttlSeconds * 1000;
  }

  set(key: string, value: Record<string, unknown>): void {
    this.cache.set(key, {
      key,
      value,
      ttl: this.ttlMs,
      createdAt: Date.now(),
    });
  }

  get(key: string): Record<string, unknown> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.createdAt;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }

  stats(): Record<string, unknown> {
    return {
      size: this.cache.size,
      ttlMs: this.ttlMs,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export type IndexEntry = {
  id: string;
  type: string;
  tags: string[];
  searchText: string;
};

export class IndexManager {
  private index: Map<string, IndexEntry> = new Map();
  private root: string;

  constructor(root: string) {
    this.root = root;
  }

  add(entry: IndexEntry): void {
    this.index.set(entry.id, entry);
  }

  search(query: string): IndexEntry[] {
    const q = query.toLowerCase();
    return Array.from(this.index.values()).filter((e) => e.searchText.toLowerCase().includes(q));
  }

  searchByTag(tag: string): IndexEntry[] {
    const t = tag.toLowerCase();
    return Array.from(this.index.values()).filter((e) => e.tags.some((tag) => tag.toLowerCase().includes(t)));
  }

  save(): void {
    const indexPath = path.join(this.root, ".mcp", "index.json");
    const indexDir = path.dirname(indexPath);
    if (!fs.existsSync(indexDir)) fs.mkdirSync(indexDir, { recursive: true });

    const data = Array.from(this.index.values());
    fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
  }

  load(): void {
    const indexPath = path.join(this.root, ".mcp", "index.json");
    if (!fs.existsSync(indexPath)) return;

    try {
      const data = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as IndexEntry[];
      for (const entry of data) {
        this.index.set(entry.id, entry);
      }
    } catch {
      // ignore
    }
  }

  stats(): Record<string, unknown> {
    return {
      size: this.index.size,
      entries: Array.from(this.index.keys()),
    };
  }
}
