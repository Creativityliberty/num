function splitForClaude(messages) {
    const systemParts = [];
    const chat = [];
    for (const m of messages) {
        if (m.role === "system")
            systemParts.push(m.content);
        else if (m.role === "developer")
            systemParts.push(m.content);
        else if (m.role === "user")
            chat.push({ role: "user", content: m.content });
    }
    return { system: systemParts.join("\n\n"), messages: chat };
}
export class AnthropicAdapter {
    id = "anthropic";
    apiKey;
    model;
    baseUrl;
    constructor(opts) {
        this.apiKey = opts.apiKey;
        this.model = opts.model;
        this.baseUrl = opts.baseUrl ?? "https://api.anthropic.com/v1";
    }
    async completeJSON(opts) {
        const { system, messages } = splitForClaude(opts.messages);
        const payload = {
            model: this.model,
            max_tokens: 4096,
            system,
            messages,
        };
        const res = await fetch(`${this.baseUrl}/messages`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Anthropic response error ${res.status}: ${text.slice(0, 500)}`);
        }
        const json = (await res.json());
        const out = json.content?.map((c) => c?.text).join("") ?? JSON.stringify(json);
        return String(out);
    }
}
//# sourceMappingURL=anthropic.js.map