import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../adapter.js";
export type GenericAdapterOptions = {
    onPrompt: (messages: LLMMessage[], expected: ExpectedSchemaName) => Promise<string>;
};
export declare class GenericAdapter implements LLMAdapter {
    id: string;
    private onPrompt;
    constructor(opts: GenericAdapterOptions);
    completeJSON(opts: {
        messages: LLMMessage[];
        expected: ExpectedSchemaName;
    }): Promise<string>;
}
//# sourceMappingURL=generic.d.ts.map