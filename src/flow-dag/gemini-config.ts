// Gemini API Configuration - Centralized API key and model management

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

export class GeminiConfigManager {
  private config: GeminiConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      defaultModel: 'gemini-2.5-flash',
      models: {
        'gemini-3-pro-preview': {
          name: 'Gemini 3 Pro Preview',
          type: 'multimodal',
          inputLimit: 1048576,
          outputLimit: 65536,
          costPer1kInputTokens: 0.0015,
          costPer1kOutputTokens: 0.006,
        },
        'gemini-2.5-pro': {
          name: 'Gemini 2.5 Pro',
          type: 'multimodal',
          inputLimit: 1048576,
          outputLimit: 65536,
          costPer1kInputTokens: 0.001,
          costPer1kOutputTokens: 0.004,
        },
        'gemini-2.5-flash': {
          name: 'Gemini 2.5 Flash',
          type: 'multimodal',
          inputLimit: 1048576,
          outputLimit: 65536,
          costPer1kInputTokens: 0.000075,
          costPer1kOutputTokens: 0.0003,
        },
        'gemini-2.0-flash': {
          name: 'Gemini 2.0 Flash',
          type: 'multimodal',
          inputLimit: 1000000,
          outputLimit: 8000,
          costPer1kInputTokens: 0.000075,
          costPer1kOutputTokens: 0.0003,
        },
        'gemini-embedding-001': {
          name: 'Gemini Embedding',
          type: 'embedding',
          inputLimit: 2048,
          outputLimit: 3072,
          costPer1kInputTokens: 0.00002,
          costPer1kOutputTokens: 0,
        },
      },
    };
  }

  // Get API key
  getApiKey(): string {
    return this.config.apiKey;
  }

  // Get default model
  getDefaultModel(): string {
    return this.config.defaultModel;
  }

  // Set default model
  setDefaultModel(model: string): void {
    if (this.config.models[model]) {
      this.config.defaultModel = model;
    }
  }

  // Get model config
  getModelConfig(model: string): ModelConfig | null {
    return this.config.models[model] || null;
  }

  // List all models
  listModels(): Record<string, ModelConfig> {
    return this.config.models;
  }

  // Calculate cost
  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const modelConfig = this.getModelConfig(model);
    if (!modelConfig) return 0;

    const inputCost = (inputTokens / 1000) * modelConfig.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * modelConfig.costPer1kOutputTokens;

    return inputCost + outputCost;
  }

  // Validate API key
  isValidApiKey(): boolean {
    return Boolean(this.config.apiKey && this.config.apiKey.length > 0);
  }
}

export function createGeminiConfig(apiKey: string): GeminiConfigManager {
  return new GeminiConfigManager(apiKey);
}
