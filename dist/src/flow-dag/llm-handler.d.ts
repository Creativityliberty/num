import { z } from 'zod';
export interface LLMConfig {
    provider: 'gemini' | 'openai' | 'anthropic' | 'local';
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface LLMResponse {
    content: string;
    model: string;
    tokensUsed?: {
        input: number;
        output: number;
    };
}
export declare class LLMHandler {
    private config;
    constructor(config: LLMConfig);
    call(prompt: string, schema?: z.ZodSchema): Promise<any>;
    private callGemini;
    private callOpenAI;
    private callAnthropic;
    private callLocal;
    private zodToJsonSchema;
    getAvailableModels(): string[];
    switchModel(model: string): void;
    getConfig(): LLMConfig;
}
export declare function createLLMHandler(provider?: string, model?: string): LLMHandler;
export declare const defaultLLMHandler: LLMHandler;
