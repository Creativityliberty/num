export class GenericAdapter {
    id = "generic";
    onPrompt;
    constructor(opts) {
        this.onPrompt = opts.onPrompt;
    }
    async completeJSON(opts) {
        return await this.onPrompt(opts.messages, opts.expected);
    }
}
//# sourceMappingURL=generic.js.map