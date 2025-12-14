import fs from "node:fs";

export type SimpleTrustPolicy = {
  allowUntrusted?: boolean;
  trustedPublishers?: string[];
};

export type SimpleTrustResult = {
  trusted: boolean;
  publisher?: string;
  reason?: string;
};

export async function verifyPackTrust(opts: {
  bundlePath: string;
  trustPolicyPath: string;
}): Promise<SimpleTrustResult> {
  // Load trust policy
  let policy: SimpleTrustPolicy = { allowUntrusted: true };
  try {
    const raw = fs.readFileSync(opts.trustPolicyPath, "utf-8");
    policy = JSON.parse(raw);
  } catch {
    return { trusted: false, reason: "TRUST_POLICY_INVALID" };
  }

  // Load bundle
  let bundle: { signature?: string; publisherId?: string; bundle?: unknown };
  try {
    const raw = fs.readFileSync(opts.bundlePath, "utf-8");
    bundle = JSON.parse(raw);
  } catch {
    return { trusted: false, reason: "BUNDLE_INVALID" };
  }

  const publisher = bundle.publisherId;

  // If no signature and allowUntrusted is false -> reject
  if (!bundle.signature) {
    if (policy.allowUntrusted) {
      return { trusted: true, publisher: undefined, reason: "UNSIGNED_ALLOWED" };
    }
    return { trusted: false, reason: "UNSIGNED_NOT_ALLOWED" };
  }

  // Check trusted publishers
  if (policy.trustedPublishers?.length) {
    if (!publisher || !policy.trustedPublishers.includes(publisher)) {
      if (!policy.allowUntrusted) {
        return { trusted: false, publisher, reason: "PUBLISHER_NOT_TRUSTED" };
      }
    }
  }

  // For full signature verification, we'd need the public key from the policy
  // For now, if publisher is trusted and signature exists, we trust it
  return { trusted: true, publisher, reason: "SIGNATURE_PRESENT" };
}
