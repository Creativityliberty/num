import type { ExpectedSchemaName, LLMAdapter, LLMMessage } from "../adapter.js";

export type GenericAdapterOptions = {
  onPrompt: (messages: LLMMessage[], expected: ExpectedSchemaName) => Promise<string>;
};

export class GenericAdapter implements LLMAdapter {
  id = "generic";
  private onPrompt: GenericAdapterOptions["onPrompt"];

  constructor(opts: GenericAdapterOptions) {
    this.onPrompt = opts.onPrompt;
  }

  async completeJSON(opts: { messages: LLMMessage[]; expected: ExpectedSchemaName }): Promise<string> {
    return await this.onPrompt(opts.messages, opts.expected);
  }
}
