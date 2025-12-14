// Context Caching and Token Management Handler
// Supports implicit and explicit caching with cost optimization

export interface CacheConfig {
  displayName: string;
  ttl?: string; // e.g., "300s", "3600s"
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
  imageTokens: number; // 258 tokens per image (Gemini 2.0)
  videoTokens: number; // 263 tokens per second
  audioTokens: number; // 32 tokens per second
  totalTokens: number;
}

// Model Token Limits
export const MODEL_TOKEN_LIMITS: Record<string, { input: number; output: number; minCache: number }> = {
  'gemini-3-pro-preview': { input: 1048576, output: 65536, minCache: 4096 },
  'gemini-2.5-pro': { input: 1048576, output: 65536, minCache: 4096 },
  'gemini-2.5-flash': { input: 1048576, output: 65536, minCache: 1024 },
  'gemini-2.5-flash-lite': { input: 1048576, output: 65536, minCache: 1024 },
  'gemini-2.0-flash': { input: 1000000, output: 8000, minCache: 1024 },
};

// Context Caching Manager - Manages cached content
export class ContextCachingManager {
  private caches: Map<string, CachedContent> = new Map();
  private defaultTTL: string = '3600s'; // 1 hour default

  // Create a new cache
  createCache(config: CacheConfig): CachedContent {
    const cache: CachedContent = {
      name: `caches/${Date.now()}`,
      displayName: config.displayName,
      model: 'gemini-2.5-flash',
      ttl: config.ttl || this.defaultTTL,
      expireTime: config.expireTime || new Date(Date.now() + 3600000),
      createdTime: new Date().toISOString(),
      usageMetadata: {
        cachedContentTokenCount: 0,
        promptTokenCount: 0,
        totalTokenCount: 0,
      },
    };

    this.caches.set(cache.name, cache);
    return cache;
  }

  // Get cache
  getCache(name: string): CachedContent | undefined {
    return this.caches.get(name);
  }

  // List all caches
  listCaches(): CachedContent[] {
    return Array.from(this.caches.values());
  }

  // Update cache TTL
  updateCacheTTL(name: string, ttl: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.ttl = ttl;
      cache.updateTime = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Update cache expiry time
  updateCacheExpireTime(name: string, expireTime: Date): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.expireTime = expireTime;
      cache.updateTime = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Delete cache
  deleteCache(name: string): boolean {
    return this.caches.delete(name);
  }

  // Check if cache is expired
  isCacheExpired(name: string): boolean {
    const cache = this.caches.get(name);
    if (!cache || !cache.expireTime) return false;
    return new Date() > cache.expireTime;
  }

  // Get cache stats
  getCacheStats(): {
    totalCaches: number;
    activeCaches: number;
    expiredCaches: number;
    totalCachedTokens: number;
  } {
    const caches = Array.from(this.caches.values());
    const now = new Date();

    return {
      totalCaches: caches.length,
      activeCaches: caches.filter(c => !c.expireTime || now <= c.expireTime).length,
      expiredCaches: caches.filter(c => c.expireTime && now > c.expireTime).length,
      totalCachedTokens: caches.reduce((sum, c) => sum + (c.usageMetadata?.cachedContentTokenCount || 0), 0),
    };
  }
}

// Token Counter - Counts tokens for different modalities
export class TokenCounter {
  private modelLimits: typeof MODEL_TOKEN_LIMITS;

  constructor() {
    this.modelLimits = MODEL_TOKEN_LIMITS;
  }

  // Count text tokens (approximately 1 token per 4 characters)
  countTextTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Count image tokens (258 tokens per image for Gemini 2.0+)
  countImageTokens(imageCount: number = 1): number {
    return imageCount * 258;
  }

  // Count video tokens (263 tokens per second)
  countVideoTokens(durationSeconds: number): number {
    return Math.ceil(durationSeconds * 263);
  }

  // Count audio tokens (32 tokens per second)
  countAudioTokens(durationSeconds: number): number {
    return Math.ceil(durationSeconds * 32);
  }

  // Count total tokens for mixed content
  countTotalTokens(content: {
    text?: string;
    images?: number;
    videoDuration?: number;
    audioDuration?: number;
  }): TokenCounts {
    const textTokens = content.text ? this.countTextTokens(content.text) : 0;
    const imageTokens = content.images ? this.countImageTokens(content.images) : 0;
    const videoTokens = content.videoDuration ? this.countVideoTokens(content.videoDuration) : 0;
    const audioTokens = content.audioDuration ? this.countAudioTokens(content.audioDuration) : 0;

    return {
      textTokens,
      imageTokens,
      videoTokens,
      audioTokens,
      totalTokens: textTokens + imageTokens + videoTokens + audioTokens,
    };
  }

  // Get model token limits
  getModelLimits(model: string): { input: number; output: number; minCache: number } | null {
    return this.modelLimits[model] || null;
  }

  // Check if content fits in model context
  fitsInContext(model: string, tokenCount: number): boolean {
    const limits = this.getModelLimits(model);
    if (!limits) return false;
    return tokenCount <= limits.input;
  }

  // Check if content meets minimum cache requirement
  meetsMinimumCache(model: string, tokenCount: number): boolean {
    const limits = this.getModelLimits(model);
    if (!limits) return false;
    return tokenCount >= limits.minCache;
  }

  // Calculate cost savings with caching
  calculateCostSavings(cachedTokens: number, requestCount: number): {
    savingsPercentage: number;
    estimatedSavings: string;
  } {
    // Cached tokens cost ~90% less than regular tokens
    const savingsPercentage = 90;
    const estimatedSavings = `${(cachedTokens * requestCount * 0.9).toFixed(0)} tokens saved`;

    return {
      savingsPercentage,
      estimatedSavings,
    };
  }
}

// Implicit Caching Manager - Automatic caching for Gemini 2.5 models
export class ImplicitCachingManager {
  private minTokenLimits: Record<string, number> = {
    'gemini-3-pro-preview': 4096,
    'gemini-2.5-pro': 4096,
    'gemini-2.5-flash': 1024,
    'gemini-2.5-flash-lite': 1024,
  };

  // Check if implicit caching is available for model
  isImplicitCachingAvailable(model: string): boolean {
    return model.includes('gemini-2.5') || model.includes('gemini-3');
  }

  // Get minimum tokens for implicit caching
  getMinimumTokens(model: string): number {
    return this.minTokenLimits[model] || 1024;
  }

  // Check if content qualifies for implicit caching
  qualifiesForImplicitCaching(model: string, tokenCount: number): boolean {
    if (!this.isImplicitCachingAvailable(model)) {
      return false;
    }
    return tokenCount >= this.getMinimumTokens(model);
  }

  // Get implicit caching recommendations
  getRecommendations(): string[] {
    return [
      'Put large and common contents at the beginning of your prompt',
      'Send requests with similar prefix in a short amount of time',
      'Monitor cache_hit_tokens in usage_metadata for cache hits',
      'Implicit caching is automatic - no configuration needed',
    ];
  }
}

// Caching and Token Management Handler - Orchestrates all caching operations
export class CachingTokensHandler {
  private cachingManager: ContextCachingManager;
  private tokenCounter: TokenCounter;
  private implicitCachingManager: ImplicitCachingManager;

  constructor() {
    this.cachingManager = new ContextCachingManager();
    this.tokenCounter = new TokenCounter();
    this.implicitCachingManager = new ImplicitCachingManager();
  }

  // Create explicit cache
  createExplicitCache(config: CacheConfig): CachedContent {
    return this.cachingManager.createCache(config);
  }

  // Get cache
  getCache(name: string): CachedContent | undefined {
    return this.cachingManager.getCache(name);
  }

  // List caches
  listCaches(): CachedContent[] {
    return this.cachingManager.listCaches();
  }

  // Update cache TTL
  updateCacheTTL(name: string, ttl: string): boolean {
    return this.cachingManager.updateCacheTTL(name, ttl);
  }

  // Delete cache
  deleteCache(name: string): boolean {
    return this.cachingManager.deleteCache(name);
  }

  // Count tokens
  countTokens(content: {
    text?: string;
    images?: number;
    videoDuration?: number;
    audioDuration?: number;
  }): TokenCounts {
    return this.tokenCounter.countTotalTokens(content);
  }

  // Check if content fits in model
  fitsInModel(model: string, tokenCount: number): boolean {
    return this.tokenCounter.fitsInContext(model, tokenCount);
  }

  // Check if content meets cache minimum
  meetsMinimumCache(model: string, tokenCount: number): boolean {
    return this.tokenCounter.meetsMinimumCache(model, tokenCount);
  }

  // Get implicit caching info
  getImplicitCachingInfo(model: string, tokenCount: number): {
    available: boolean;
    qualifies: boolean;
    minimumTokens: number;
    recommendations: string[];
  } {
    return {
      available: this.implicitCachingManager.isImplicitCachingAvailable(model),
      qualifies: this.implicitCachingManager.qualifiesForImplicitCaching(model, tokenCount),
      minimumTokens: this.implicitCachingManager.getMinimumTokens(model),
      recommendations: this.implicitCachingManager.getRecommendations(),
    };
  }

  // Calculate cost savings
  calculateCostSavings(cachedTokens: number, requestCount: number): {
    savingsPercentage: number;
    estimatedSavings: string;
  } {
    return this.tokenCounter.calculateCostSavings(cachedTokens, requestCount);
  }

  // Get caching strategy recommendation
  getCachingStrategy(model: string, tokenCount: number, requestCount: number): {
    strategy: 'implicit' | 'explicit' | 'none';
    reason: string;
    estimatedSavings?: string;
  } {
    // Check if implicit caching is available
    if (this.implicitCachingManager.qualifiesForImplicitCaching(model, tokenCount)) {
      return {
        strategy: 'implicit',
        reason: 'Implicit caching is automatically enabled for Gemini 2.5 models',
      };
    }

    // Check if explicit caching makes sense
    if (
      this.tokenCounter.meetsMinimumCache(model, tokenCount) &&
      requestCount >= 2
    ) {
      const savings = this.tokenCounter.calculateCostSavings(tokenCount, requestCount);
      return {
        strategy: 'explicit',
        reason: `Explicit caching recommended for ${requestCount} requests with ${tokenCount} tokens`,
        estimatedSavings: savings.estimatedSavings,
      };
    }

    return {
      strategy: 'none',
      reason: 'Content does not meet minimum requirements for caching',
    };
  }

  // Get comprehensive caching stats
  getComprehensiveStats(): {
    caches: {
      totalCaches: number;
      activeCaches: number;
      expiredCaches: number;
      totalCachedTokens: number;
    };
    modelLimits: Record<string, { input: number; output: number; minCache: number }>;
  } {
    return {
      caches: this.cachingManager.getCacheStats(),
      modelLimits: MODEL_TOKEN_LIMITS,
    };
  }
}

// Export factory function
export function createCachingTokensHandler(): CachingTokensHandler {
  return new CachingTokensHandler();
}
