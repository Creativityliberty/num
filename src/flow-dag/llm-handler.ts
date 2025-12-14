import type { z } from 'zod';

// LLM Provider Configuration
export interface LLMConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// LLM Response
export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

// LLM Handler - Abstraction for different LLM providers
export class LLMHandler {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };
  }

  async call(prompt: string, schema?: z.ZodSchema): Promise<any> {
    switch (this.config.provider) {
      case 'gemini':
        return this.callGemini(prompt, schema);
      case 'openai':
        return this.callOpenAI(prompt, schema);
      case 'anthropic':
        return this.callAnthropic(prompt, schema);
      case 'local':
        return this.callLocal(prompt, schema);
      default:
        throw new Error(`Unknown LLM provider: ${this.config.provider}`);
    }
  }

  private async callGemini(prompt: string, schema?: z.ZodSchema): Promise<any> {
    // Gemini API implementation
    const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + this.config.model + ':generateContent';

    const body: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    };

    // Add structured output if schema provided
    if (schema) {
      body.generationConfig.responseMimeType = 'application/json';
      body.generationConfig.responseJsonSchema = this.zodToJsonSchema(schema);
    }

    const response = await fetch(url + `?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.choices?.[0]?.message?.content || data?.content || '';

    // Parse JSON if schema provided
    if (schema) {
      try {
        return schema.parse(JSON.parse(content));
      } catch (error) {
        throw new Error(`Schema validation failed: ${error}`);
      }
    }

    return content;
  }

  private async callOpenAI(prompt: string, schema?: z.ZodSchema): Promise<any> {
    // OpenAI API implementation
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not set');
    }

    const url = this.config.baseUrl || 'https://api.openai.com/v1/chat/completions';

    const body: any = {
      model: this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    // Add structured output if schema provided
    if (schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: this.zodToJsonSchema(schema),
        },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON if schema provided
    if (schema) {
      try {
        return schema.parse(JSON.parse(content));
      } catch (error) {
        throw new Error(`Schema validation failed: ${error}`);
      }
    }

    return content;
  }

  private async callAnthropic(prompt: string, schema?: z.ZodSchema): Promise<any> {
    // Anthropic API implementation
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }

    const url = this.config.baseUrl || 'https://api.anthropic.com/v1/messages';

    const body: any = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON if schema provided
    if (schema) {
      try {
        return schema.parse(JSON.parse(content));
      } catch (error) {
        throw new Error(`Schema validation failed: ${error}`);
      }
    }

    return content;
  }

  private async callLocal(prompt: string, schema?: z.ZodSchema): Promise<any> {
    // Local LLM implementation (e.g., Ollama, LLaMA.cpp)
    const url = this.config.baseUrl || 'http://localhost:11434/api/generate';

    const body = {
      model: this.config.model,
      prompt: prompt,
      stream: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.response;

    // Parse JSON if schema provided
    if (schema) {
      try {
        return schema.parse(JSON.parse(content));
      } catch (error) {
        throw new Error(`Schema validation failed: ${error}`);
      }
    }

    return content;
  }

  private zodToJsonSchema(schema: z.ZodSchema): any {
    // Convert Zod schema to JSON Schema
    // This is a simplified version - for production, use zod-to-json-schema package
    return {
      type: 'object',
      properties: {},
      required: [],
    };
  }

  // Get available models for current provider
  getAvailableModels(): string[] {
    const models: Record<string, string[]> = {
      gemini: [
        'gemini-3-pro-preview',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro',
      ],
      openai: [
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
      ],
      anthropic: [
        'claude-3-5-sonnet-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
      ],
      local: [
        'llama2',
        'mistral',
        'neural-chat',
        'custom',
      ],
    };

    return models[this.config.provider] || [];
  }

  // Switch model at runtime
  switchModel(model: string): void {
    this.config.model = model;
  }

  // Get current config
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

// Factory function to create LLM handler
export function createLLMHandler(provider: string = 'gemini', model?: string): LLMHandler {
  const providerConfig: LLMConfig = {
    provider: (provider as any) || 'gemini',
    model: model || 'gemini-2.5-flash',
  };

  return new LLMHandler(providerConfig);
}

// Default LLM handler instance
export const defaultLLMHandler = createLLMHandler(
  process.env.LLM_PROVIDER || 'gemini',
  process.env.LLM_MODEL || 'gemini-2.5-flash'
);
