export async function withRetries(fn, opts) {
    const total = Math.max(0, opts.retries);
    let lastErr;
    for (let attempt = 0; attempt <= total; attempt++) {
        try {
            return await fn(attempt);
        }
        catch (e) {
            lastErr = e;
            opts.onError?.(e, attempt);
            if (attempt === total)
                break;
        }
    }
    throw lastErr;
}
//# sourceMappingURL=retry.js.map