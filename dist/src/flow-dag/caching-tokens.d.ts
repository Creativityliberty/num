export interface CacheConfig {
    displayName: string;
    ttl?: string;
    expireTime?: Date;
    systemInstruction?: string;
    contents?: Record<string, unknown>[];
}
export interface CachedContent {
    name: string;
    displayName: string;
    model: string;
    ttl?: string;
    expireTime?: Date;
    createdTime?: string;
    updateTime?: string;
    usageMetadata?: {
        cachedContentTokenCount: number;
        promptTokenCount: number;
        totalTokenCount: number;
    };
}
export interface TokenUsageMetadata {
    promptTokenCount: number;
    cachedContentTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    cacheHitTokens?: number;
}
export interface TokenCounts {
    textTokens: number;
    imageTokens: number;
    videoTokens: number;
    audioTokens: number;
    totalTokens: number;
}
export declare const MODEL_TOKEN_LIMITS: Record<string, {
    input: number;
    output: number;
    minCache: number;
}>;
export declare class ContextCachingManager {
    private caches;
    private defaultTTL;
    createCache(config: CacheConfig): CachedContent;
    getCache(name: string): CachedContent | undefined;
    listCaches(): CachedContent[];
    updateCacheTTL(name: string, ttl: string): boolean;
    updateCacheExpireTime(name: string, expireTime: Date): boolean;
    deleteCache(name: string): boolean;
    isCacheExpired(name: string): boolean;
    getCacheStats(): {
        totalCaches: number;
        activeCaches: number;
        expiredCaches: number;
        totalCachedTokens: number;
    };
}
export declare class TokenCounter {
    private modelLimits;
    constructor();
    countTextTokens(text: string): number;
    countImageTokens(imageCount?: number): number;
    countVideoTokens(durationSeconds: number): number;
    countAudioTokens(durationSeconds: number): number;
    countTotalTokens(content: {
        text?: string;
        images?: number;
        videoDuration?: number;
        audioDuration?: number;
    }): TokenCounts;
    getModelLimits(model: string): {
        input: number;
        output: number;
        minCache: number;
    } | null;
    fitsInContext(model: string, tokenCount: number): boolean;
    meetsMinimumCache(model: string, tokenCount: number): boolean;
    calculateCostSavings(cachedTokens: number, requestCount: number): {
        savingsPercentage: number;
        estimatedSavings: string;
    };
}
export declare class ImplicitCachingManager {
    private minTokenLimits;
    isImplicitCachingAvailable(model: string): boolean;
    getMinimumTokens(model: string): number;
    qualifiesForImplicitCaching(model: string, tokenCount: number): boolean;
    getRecommendations(): string[];
}
export declare class CachingTokensHandler {
    private cachingManager;
    private tokenCounter;
    private implicitCachingManager;
    constructor();
    createExplicitCache(config: CacheConfig): CachedContent;
    getCache(name: string): CachedContent | undefined;
    listCaches(): CachedContent[];
    updateCacheTTL(name: string, ttl: string): boolean;
    deleteCache(name: string): boolean;
    countTokens(content: {
        text?: string;
        images?: number;
        videoDuration?: number;
        audioDuration?: number;
    }): TokenCounts;
    fitsInModel(model: string, tokenCount: number): boolean;
    meetsMinimumCache(model: string, tokenCount: number): boolean;
    getImplicitCachingInfo(model: string, tokenCount: number): {
        available: boolean;
        qualifies: boolean;
        minimumTokens: number;
        recommendations: string[];
    };
    calculateCostSavings(cachedTokens: number, requestCount: number): {
        savingsPercentage: number;
        estimatedSavings: string;
    };
    getCachingStrategy(model: string, tokenCount: number, requestCount: number): {
        strategy: 'implicit' | 'explicit' | 'none';
        reason: string;
        estimatedSavings?: string;
    };
    getComprehensiveStats(): {
        caches: {
            totalCaches: number;
            activeCaches: number;
            expiredCaches: number;
            totalCachedTokens: number;
        };
        modelLimits: Record<string, {
            input: number;
            output: number;
            minCache: number;
        }>;
    };
}
export declare function createCachingTokensHandler(): CachingTokensHandler;
