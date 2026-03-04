import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeout: 30000,
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = opts.initialDelayMs!;

  for (let attempt = 1; attempt <= opts.maxAttempts!; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error('Operation timeout')),
            opts.timeout
          )
        ),
      ]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(
        { attempt, error: lastError.message, nextRetryMs: delay },
        `Retry attempt ${attempt}/${opts.maxAttempts}`
      );

      if (attempt < opts.maxAttempts!) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * opts.backoffMultiplier!, opts.maxDelayMs!);
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  const jitterAmount = () => Math.random() * 1000; // 0-1s jitter
  return retryWithBackoff(fn, {
    maxAttempts,
    initialDelayMs: 100 + jitterAmount(),
  });
}