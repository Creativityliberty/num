export type SimpleTrustPolicy = {
    allowUntrusted?: boolean;
    trustedPublishers?: string[];
};
export type SimpleTrustResult = {
    trusted: boolean;
    publisher?: string;
    reason?: string;
};
export declare function verifyPackTrust(opts: {
    bundlePath: string;
    trustPolicyPath: string;
}): Promise<SimpleTrustResult>;
