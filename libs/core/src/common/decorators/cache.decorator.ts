import { RedisCacheService } from '../../cache/redis-cache.service';

/**
 * Resolves a cache key template by replacing :argN with actual method arguments.
 * Example: "user:profile::arg0" with args ["abc"] → "user:profile:abc"
 */
function resolveKey(template: string, args: unknown[]): string {
  return template.replace(/:arg(\d+)/g, (_, index) => String(args[+index] ?? ''));
}

/**
 * @Cacheable - Cache the return value of an async method.
 *
 * Usage:
 *   @Cacheable({ key: 'user:profile::arg0', ttl: 300 })
 *   async getFullProfile(userId: string) { ... }
 *
 * The result is cached in Redis. On subsequent calls with the same key,
 * the cached value is returned without executing the method.
 *
 * Key placeholders: :arg0, :arg1, :arg2... map to method arguments by position.
 */
export function Cacheable(options: { key: string; ttl: number }) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: unknown[]) {
      const cache: RedisCacheService | undefined = this.cache;
      if (!cache) return originalMethod.apply(this, args);

      const cacheKey = resolveKey(options.key, args);
      const cached = await cache.get(cacheKey);
      if (cached !== null) return cached;

      const result = await originalMethod.apply(this, args);
      await cache.set(cacheKey, result, options.ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * @CacheEvict - Invalidate cache entries after method execution.
 *
 * Usage:
 *   @CacheEvict({ key: 'user:profile::arg0' })
 *   async updateProfile(userId: string, dto: UpdateProfileDto) { ... }
 *
 *   @CacheEvict({ pattern: 'notif:unread::arg0:*' })
 *   async markAsRead(id: string, userId: string) { ... }
 *
 * Use `key` for exact key deletion, `pattern` for wildcard deletion.
 * Key placeholders: :arg0, :arg1, :arg2... map to method arguments by position.
 */
export function CacheEvict(options: { key?: string; pattern?: string }) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      const cache: RedisCacheService | undefined = this.cache;
      if (!cache) return result;

      if (options.key) {
        await cache.del(resolveKey(options.key, args));
      }
      if (options.pattern) {
        await cache.delPattern(resolveKey(options.pattern, args));
      }

      return result;
    };

    return descriptor;
  };
}
