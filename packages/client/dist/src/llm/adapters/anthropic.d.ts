import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../adapter.js";
export type AnthropicAdapterOptions = {
    apiKey: string;
    model: string;
    baseUrl?: string;
};
export declare class AnthropicAdapter implements LLMAdapter {
    id: string;
    private apiKey;
    private model;
    private baseUrl;
    constructor(opts: AnthropicAdapterOptions);
    completeJSON(opts: {
        messages: LLMMessage[];
        expected: ExpectedSchemaName;
        maxRetries?: number;
    }): Promise<string>;
}
//# sourceMappingURL=anthropic.d.ts.map