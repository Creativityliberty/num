export declare function withRetries<T>(fn: (attempt: number) => Promise<T>, opts: {
    retries: number;
    onError?: (e: unknown, attempt: number) => void;
}): Promise<T>;
//# sourceMappingURL=retry.d.ts.map