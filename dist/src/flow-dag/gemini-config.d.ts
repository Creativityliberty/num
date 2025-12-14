export interface GeminiConfig {
    apiKey: string;
    defaultModel: string;
    models: Record<string, ModelConfig>;
}
export interface ModelConfig {
    name: string;
    type: 'text' | 'embedding' | 'vision' | 'multimodal';
    inputLimit: number;
    outputLimit: number;
    costPer1kInputTokens: number;
    costPer1kOutputTokens: number;
}
export declare class GeminiConfigManager {
    private config;
    constructor(apiKey: string);
    getApiKey(): string;
    getDefaultModel(): string;
    setDefaultModel(model: string): void;
    getModelConfig(model: string): ModelConfig | null;
    listModels(): Record<string, ModelConfig>;
    calculateCost(model: string, inputTokens: number, outputTokens: number): number;
    isValidApiKey(): boolean;
}
export declare function createGeminiConfig(apiKey: string): GeminiConfigManager;
