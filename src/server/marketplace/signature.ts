import crypto from "node:crypto";
import type { Publisher, SignedPackBundle, TrustPolicy } from "../../core/marketplace.schema.js";
import type { PackBundle } from "../../core/pack.bundle.schema.js";

export function hashBundle(bundle: PackBundle): string {
  const canonical = JSON.stringify(bundle, Object.keys(bundle).sort());
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function signBundle(bundle: PackBundle, privateKey: string): string {
  const hash = hashBundle(bundle);
  const sign = crypto.createSign("SHA256");
  sign.update(hash);
  return sign.sign(privateKey, "base64");
}

export function verifySignature(signed: SignedPackBundle, publicKey: string): boolean {
  try {
    const hash = hashBundle(signed.bundle);
    const verify = crypto.createVerify("SHA256");
    verify.update(hash);
    return verify.verify(publicKey, signed.signature, "base64");
  } catch {
    return false;
  }
}

export interface VerifyResult {
  valid: boolean;
  trusted: boolean;
  publisher: Publisher | null;
  error?: string;
}

export function verifyPackTrust(signed: SignedPackBundle, policy: TrustPolicy): VerifyResult {
  // Find publisher
  const publisher = policy.trustedPublishers.find((p) => p.id === signed.publisherId) ?? null;

  // No signature check if allowUnsigned
  if (!signed.signature && policy.allowUnsigned) {
    return { valid: true, trusted: false, publisher: null };
  }

  if (!signed.signature) {
    return { valid: false, trusted: false, publisher: null, error: "Pack is not signed" };
  }

  // Unknown publisher
  if (!publisher) {
    if (policy.allowUntrusted) {
      return { valid: true, trusted: false, publisher: null };
    }
    return { valid: false, trusted: false, publisher: null, error: "Unknown publisher" };
  }

  // Verify signature
  const signatureValid = verifySignature(signed, publisher.publicKey);
  if (!signatureValid) {
    return { valid: false, trusted: false, publisher, error: "Invalid signature" };
  }

  return {
    valid: true,
    trusted: publisher.trusted,
    publisher,
  };
}

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}
