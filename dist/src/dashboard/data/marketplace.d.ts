export type PublishPackInput = {
    packId: string;
    version: string;
    description?: string;
    tags?: string[];
    author?: string;
};
export type InstallPackInput = {
    packId: string;
    version?: string;
    source?: string;
};
export type MarketplaceResult = {
    ok: boolean;
    packId: string;
    version: string;
    message?: string;
    error?: string;
};
export declare function publishPack(root: string, input: PublishPackInput): MarketplaceResult;
export declare function installPack(root: string, input: InstallPackInput): MarketplaceResult;
export declare function listMarketplacePacks(root: string): Record<string, unknown>[];
