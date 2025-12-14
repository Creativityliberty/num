import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
export class McpToolClient {
    client;
    transport;
    constructor(client, transport) {
        this.client = client;
        this.transport = transport;
    }
    static async connectStdio(opts) {
        const transportOpts = {
            command: opts.command,
            args: opts.args,
        };
        if (opts.env !== undefined)
            transportOpts.env = opts.env;
        if (opts.cwd !== undefined)
            transportOpts.cwd = opts.cwd;
        const transport = new StdioClientTransport(transportOpts);
        const client = new Client({ name: "@mcp-agents-modes/client", version: "0.1.0" }, { capabilities: {} });
        await client.connect(transport);
        return new McpToolClient(client, transport);
    }
    async close() {
        try {
            await this.client.close();
        }
        finally {
            try {
                await this.transport.close();
            }
            catch {
                // ignore
            }
        }
    }
    async callToolJSON(tool, input) {
        const res = (await this.client.callTool({
            name: tool,
            arguments: input,
        }));
        const text = res?.content?.[0]?.text;
        if (!text)
            throw new Error(`Empty tool response for ${tool}`);
        try {
            return JSON.parse(text);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            throw new Error(`Tool ${tool} returned non-JSON text: ${msg}\n${text.slice(0, 500)}`);
        }
    }
}
//# sourceMappingURL=client.js.map