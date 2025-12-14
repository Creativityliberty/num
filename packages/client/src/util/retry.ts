export async function withRetries<T>(
  fn: (attempt: number) => Promise<T>,
  opts: {
    retries: number;
    onError?: (e: unknown, attempt: number) => void;
    onRetry?: (e: unknown, attempt: number) => void;
    retryIf?: (e: unknown) => boolean;
  }
): Promise<T> {
  const total = Math.max(0, opts.retries);
  let lastErr: unknown;
  for (let attempt = 0; attempt <= total; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastErr = e;
      opts.onError?.(e, attempt);
      if (attempt === total) break;
      if (opts.retryIf && !opts.retryIf(e)) throw e;
      opts.onRetry?.(e, attempt);
    }
  }
  throw lastErr;
}
