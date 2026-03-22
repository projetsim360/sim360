import type { RedisOptions } from 'ioredis';

/**
 * Build Redis connection options from environment variables.
 * Supports REDIS_URL (Railway) or REDIS_HOST/PORT/PASSWORD (manual).
 */
export function getRedisOptions(prefix?: string): RedisOptions {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Parse REDIS_URL (format: redis://default:password@host:port)
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      ...(prefix ? { keyPrefix: prefix } : {}),
    };
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ...(prefix ? { keyPrefix: prefix } : {}),
  };
}
