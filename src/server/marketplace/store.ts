import fs from "node:fs/promises";
import path from "node:path";
import {
    MarketplacePackSchema,
    PublisherSchema,
    SignedPackBundleSchema,
    TrustPolicySchema,
    type MarketplacePack,
    type Publisher,
    type SignedPackBundle,
    type TrustPolicy,
} from "../../core/marketplace.schema.js";
import { importPack } from "../packs/io.js";
import { verifyPackTrust, type VerifyResult } from "./signature.js";

export class MarketplaceStore {
  constructor(private root: string) {}

  private marketplaceDir() {
    return path.join(this.root, ".mcp", "marketplace");
  }

  private packsFile() {
    return path.join(this.marketplaceDir(), "packs.json");
  }

  private publishersFile() {
    return path.join(this.marketplaceDir(), "publishers.json");
  }

  private trustPolicyFile() {
    return path.join(this.root, ".mcp", "trust-policy.json");
  }

  private packBundleFile(packId: string, version: string) {
    return path.join(this.marketplaceDir(), "bundles", `${packId}@${version}.json`);
  }

  async getTrustPolicy(): Promise<TrustPolicy> {
    try {
      const raw = await fs.readFile(this.trustPolicyFile(), "utf-8");
      return TrustPolicySchema.parse(JSON.parse(raw));
    } catch {
      return TrustPolicySchema.parse({});
    }
  }

  async saveTrustPolicy(policy: TrustPolicy): Promise<void> {
    await fs.mkdir(path.dirname(this.trustPolicyFile()), { recursive: true });
    await fs.writeFile(this.trustPolicyFile(), JSON.stringify(policy, null, 2));
  }

  async listPacks(): Promise<MarketplacePack[]> {
    try {
      const raw = await fs.readFile(this.packsFile(), "utf-8");
      return JSON.parse(raw).map((p: unknown) => MarketplacePackSchema.parse(p));
    } catch {
      return [];
    }
  }

  async getPack(packId: string): Promise<MarketplacePack | null> {
    const packs = await this.listPacks();
    return packs.find((p) => p.id === packId) ?? null;
  }

  async publishPack(signed: SignedPackBundle, publisherName?: string): Promise<{ ok: boolean; error?: string }> {
    const policy = await this.getTrustPolicy();
    const verification = verifyPackTrust(signed, policy);

    if (!verification.valid) {
      return { ok: false, error: verification.error };
    }

    const pack = signed.bundle.pack;
    const now = new Date().toISOString();

    const marketplacePack: MarketplacePack = MarketplacePackSchema.parse({
      id: pack.id,
      name: pack.name ?? pack.id,
      description: pack.description,
      version: pack.version ?? "0.0.0",
      publisherId: signed.publisherId,
      publisherName: publisherName ?? verification.publisher?.name,
      tags: pack.tags ?? [],
      downloads: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Save bundle
    await fs.mkdir(path.dirname(this.packBundleFile(pack.id, marketplacePack.version)), { recursive: true });
    await fs.writeFile(
      this.packBundleFile(pack.id, marketplacePack.version),
      JSON.stringify(signed, null, 2)
    );

    // Update packs list
    const packs = await this.listPacks();
    const existingIdx = packs.findIndex((p) => p.id === pack.id);
    if (existingIdx >= 0) {
      packs[existingIdx] = { ...packs[existingIdx]!, ...marketplacePack, updatedAt: now };
    } else {
      packs.push(marketplacePack);
    }

    await fs.mkdir(path.dirname(this.packsFile()), { recursive: true });
    await fs.writeFile(this.packsFile(), JSON.stringify(packs, null, 2));

    return { ok: true };
  }

  async installPack(
    packId: string,
    repoPath: string,
    opts?: { version?: string; allowOverwrite?: boolean }
  ): Promise<{ ok: boolean; verification?: VerifyResult; error?: string }> {
    const pack = await this.getPack(packId);
    if (!pack) {
      return { ok: false, error: "Pack not found" };
    }

    const version = opts?.version ?? pack.version;
    const bundlePath = this.packBundleFile(packId, version);

    try {
      const raw = await fs.readFile(bundlePath, "utf-8");
      const signed = SignedPackBundleSchema.parse(JSON.parse(raw));

      // Verify trust
      const policy = await this.getTrustPolicy();
      const verification = verifyPackTrust(signed, policy);

      if (!verification.valid) {
        return { ok: false, verification, error: verification.error };
      }

      // Import pack
      const result = await importPack({
        bundlePath,
        repoPath,
        allowOverwrite: opts?.allowOverwrite,
      });

      if (!result.ok) {
        return { ok: false, verification, error: result.message };
      }

      // Increment downloads
      const packs = await this.listPacks();
      const idx = packs.findIndex((p) => p.id === packId);
      if (idx >= 0) {
        packs[idx]!.downloads += 1;
        await fs.writeFile(this.packsFile(), JSON.stringify(packs, null, 2));
      }

      return { ok: true, verification };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listPublishers(): Promise<Publisher[]> {
    try {
      const raw = await fs.readFile(this.publishersFile(), "utf-8");
      return JSON.parse(raw).map((p: unknown) => PublisherSchema.parse(p));
    } catch {
      return [];
    }
  }

  async addPublisher(publisher: Publisher): Promise<void> {
    const publishers = await this.listPublishers();
    const existing = publishers.findIndex((p) => p.id === publisher.id);
    if (existing >= 0) {
      publishers[existing] = publisher;
    } else {
      publishers.push(publisher);
    }
    await fs.mkdir(path.dirname(this.publishersFile()), { recursive: true });
    await fs.writeFile(this.publishersFile(), JSON.stringify(publishers, null, 2));
  }
}
