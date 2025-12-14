import { type MarketplacePack, type Publisher, type SignedPackBundle, type TrustPolicy } from "../../core/marketplace.schema.js";
import { type VerifyResult } from "./signature.js";
export declare class MarketplaceStore {
    private root;
    constructor(root: string);
    private marketplaceDir;
    private packsFile;
    private publishersFile;
    private trustPolicyFile;
    private packBundleFile;
    getTrustPolicy(): Promise<TrustPolicy>;
    saveTrustPolicy(policy: TrustPolicy): Promise<void>;
    listPacks(): Promise<MarketplacePack[]>;
    getPack(packId: string): Promise<MarketplacePack | null>;
    publishPack(signed: SignedPackBundle, publisherName?: string): Promise<{
        ok: boolean;
        error?: string;
    }>;
    installPack(packId: string, repoPath: string, opts?: {
        version?: string;
        allowOverwrite?: boolean;
    }): Promise<{
        ok: boolean;
        verification?: VerifyResult;
        error?: string;
    }>;
    listPublishers(): Promise<Publisher[]>;
    addPublisher(publisher: Publisher): Promise<void>;
}
