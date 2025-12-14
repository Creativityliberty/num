import type { LLMAdapter, LLMMessage, ExpectedSchemaName } from "../adapter.js";
export type OpenAIAdapterOptions = {
    apiKey: string;
    model: string;
    baseUrl?: string;
};
export declare class OpenAIAdapter implements LLMAdapter {
    id: string;
    private apiKey;
    private model;
    private baseUrl;
    constructor(opts: OpenAIAdapterOptions);
    completeJSON(opts: {
        messages: LLMMessage[];
        expected: ExpectedSchemaName;
        maxRetries?: number;
    }): Promise<string>;
}
//# sourceMappingURL=openai.d.ts.map