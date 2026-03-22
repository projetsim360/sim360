import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getRedisOptions } from '../config/redis.utils';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(getRedisOptions('sim360:cache:'));
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`sim360:cache:${pattern}`);
    if (keys.length > 0) {
      // Keys already have the prefix from the scan, but del needs raw keys
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        // Remove the keyPrefix since redis client will add it back
        pipeline.del(key.replace('sim360:cache:', ''));
      }
      await pipeline.exec();
    }
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
