import type { Publisher, SignedPackBundle, TrustPolicy } from "../../core/marketplace.schema.js";
import type { PackBundle } from "../../core/pack.bundle.schema.js";
export declare function hashBundle(bundle: PackBundle): string;
export declare function signBundle(bundle: PackBundle, privateKey: string): string;
export declare function verifySignature(signed: SignedPackBundle, publicKey: string): boolean;
export interface VerifyResult {
    valid: boolean;
    trusted: boolean;
    publisher: Publisher | null;
    error?: string;
}
export declare function verifyPackTrust(signed: SignedPackBundle, policy: TrustPolicy): VerifyResult;
export declare function generateKeyPair(): {
    publicKey: string;
    privateKey: string;
};
