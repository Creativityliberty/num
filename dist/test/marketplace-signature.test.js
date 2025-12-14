import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateKeyPair, hashBundle, signBundle, verifyPackTrust, verifySignature } from "../src/server/marketplace/signature.js";
import { MarketplaceStore } from "../src/server/marketplace/store.js";
describe("16.0 marketplace & signatures", () => {
    const testBundle = {
        format: "mcp-agents-pack",
        version: "1",
        pack: { id: "test-pack", name: "Test Pack", version: "1.0.0", enabled: true, tags: [] },
        files: [{ path: "pack.json", content: '{"id":"test-pack"}' }],
    };
    it("generates key pair", () => {
        const { publicKey, privateKey } = generateKeyPair();
        expect(publicKey).toContain("BEGIN PUBLIC KEY");
        expect(privateKey).toContain("BEGIN PRIVATE KEY");
    });
    it("hashes bundle deterministically", () => {
        const hash1 = hashBundle(testBundle);
        const hash2 = hashBundle(testBundle);
        expect(hash1).toBe(hash2);
        expect(hash1.length).toBe(64); // SHA256 hex
    });
    it("signs and verifies bundle", () => {
        const { publicKey, privateKey } = generateKeyPair();
        const signature = signBundle(testBundle, privateKey);
        expect(signature).toBeTruthy();
        const signed = {
            bundle: testBundle,
            signature,
            publisherId: "test-publisher",
        };
        expect(verifySignature(signed, publicKey)).toBe(true);
    });
    it("rejects invalid signature", () => {
        const { publicKey } = generateKeyPair();
        const signed = {
            bundle: testBundle,
            signature: "invalid-signature",
            publisherId: "test-publisher",
        };
        expect(verifySignature(signed, publicKey)).toBe(false);
    });
    it("verifyPackTrust with trusted publisher", () => {
        const { publicKey, privateKey } = generateKeyPair();
        const signature = signBundle(testBundle, privateKey);
        const signed = {
            bundle: testBundle,
            signature,
            publisherId: "num-official",
        };
        const policy = {
            allowUnsigned: false,
            allowUntrusted: false,
            trustedPublishers: [{ id: "num-official", name: "Num Official", publicKey, trusted: true }],
        };
        const result = verifyPackTrust(signed, policy);
        expect(result.valid).toBe(true);
        expect(result.trusted).toBe(true);
        expect(result.publisher?.id).toBe("num-official");
    });
    it("verifyPackTrust rejects unknown publisher when allowUntrusted=false", () => {
        const { privateKey } = generateKeyPair();
        const signature = signBundle(testBundle, privateKey);
        const signed = {
            bundle: testBundle,
            signature,
            publisherId: "unknown",
        };
        const policy = {
            allowUnsigned: false,
            allowUntrusted: false,
            trustedPublishers: [],
        };
        const result = verifyPackTrust(signed, policy);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Unknown publisher");
    });
    it("verifyPackTrust allows unknown publisher when allowUntrusted=true", () => {
        const { privateKey } = generateKeyPair();
        const signature = signBundle(testBundle, privateKey);
        const signed = {
            bundle: testBundle,
            signature,
            publisherId: "unknown",
        };
        const policy = {
            allowUnsigned: false,
            allowUntrusted: true,
            trustedPublishers: [],
        };
        const result = verifyPackTrust(signed, policy);
        expect(result.valid).toBe(true);
        expect(result.trusted).toBe(false);
    });
    it("marketplace store publishes and lists packs", async () => {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-marketplace-"));
        const store = new MarketplaceStore(tmp);
        const { publicKey, privateKey } = generateKeyPair();
        const signature = signBundle(testBundle, privateKey);
        // Set trust policy
        await store.saveTrustPolicy({
            allowUnsigned: false,
            allowUntrusted: true,
            trustedPublishers: [{ id: "pub1", name: "Publisher 1", publicKey, trusted: true }],
        });
        const signed = {
            bundle: testBundle,
            signature,
            publisherId: "pub1",
        };
        const result = await store.publishPack(signed, "Publisher 1");
        expect(result.ok).toBe(true);
        const packs = await store.listPacks();
        expect(packs.length).toBe(1);
        expect(packs[0]?.id).toBe("test-pack");
        expect(packs[0]?.publisherId).toBe("pub1");
    });
});
//# sourceMappingURL=marketplace-signature.test.js.map