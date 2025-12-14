export type McpSpawnOptions = {
    command: string;
    args: string[];
    env?: Record<string, string>;
    cwd?: string;
};
export declare class McpToolClient {
    private client;
    private transport;
    private constructor();
    static connectStdio(opts: McpSpawnOptions): Promise<McpToolClient>;
    close(): Promise<void>;
    callToolJSON<T>(tool: string, input: unknown): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map