function toOpenAIInput(messages) {
    return messages.map((m) => ({ role: m.role === "developer" ? "developer" : m.role, content: m.content }));
}
export class OpenAIAdapter {
    id = "openai";
    apiKey;
    model;
    baseUrl;
    constructor(opts) {
        this.apiKey = opts.apiKey;
        this.model = opts.model;
        this.baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";
    }
    async completeJSON(opts) {
        const payload = {
            model: this.model,
            input: toOpenAIInput(opts.messages),
        };
        const res = await fetch(`${this.baseUrl}/responses`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`OpenAI response error ${res.status}: ${text.slice(0, 500)}`);
        }
        const json = (await res.json());
        const out = json.output_text ??
            json.output?.map((x) => x?.content?.map((c) => c?.text).join("")).join("\n") ??
            JSON.stringify(json);
        return String(out);
    }
}
//# sourceMappingURL=openai.js.map