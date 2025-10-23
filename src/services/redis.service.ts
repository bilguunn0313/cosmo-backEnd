import { RedisClientType } from "redis";
import { getRedisClient } from "../config/redis.config";
import { AppError } from "../utils/errors";

class RedisService {
  private client: RedisClientType | null = null;

  /**
   * Ensure Redis client is initialized
   */
  private async ensureClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = await getRedisClient();
    }
    return this.client;
  }

  /**
   * Set a key-value pair with optional expiration
   * @param key - Redis key
   * @param value - Value to store (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const client = await this.ensureClient();
      const stringValue = JSON.stringify(value);

      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, stringValue);
      } else {
        await client.set(key, stringValue);
      }
    } catch (error) {
      console.error("Redis SET error:", error);
      throw new AppError(
        500,
        `Failed to set Redis key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a value by key
   * @param key - Redis key
   * @returns Parsed value or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = await this.ensureClient();
      const value = await client.get(key);

      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Redis GET error:", error);
      throw new AppError(
        500,
        `Failed to get Redis key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a key
   * @param key - Redis key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      const client = await this.ensureClient();
      await client.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
      throw new AppError(
        500,
        `Failed to delete Redis key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param pattern - Pattern to match (e.g., "user:*")
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const client = await this.ensureClient();
      const keys = await client.keys(pattern);

      if (keys.length === 0) return 0;

      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.error("Redis DELETE BY PATTERN error:", error);
      throw new AppError(
        500,
        `Failed to delete keys: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if a key exists
   * @param key - Redis key
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.ensureClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  /**
   * Set expiration on a key
   * @param key - Redis key
   * @param ttlSeconds - Time to live in seconds
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      const client = await this.ensureClient();
      await client.expire(key, ttlSeconds);
    } catch (error) {
      console.error("Redis EXPIRE error:", error);
      throw new AppError(
        500,
        `Failed to set expiration: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get time to live for a key
   * @param key - Redis key
   * @returns TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = await this.ensureClient();
      return await client.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error);
      return -2;
    }
  }

  /**
   * Increment a counter
   * @param key - Redis key
   * @param amount - Amount to increment by (default: 1)
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const client = await this.ensureClient();
      return await client.incrBy(key, amount);
    } catch (error) {
      console.error("Redis INCREMENT error:", error);
      throw new AppError(
        500,
        `Failed to increment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - Pattern to match (e.g., "user:*")
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const client = await this.ensureClient();
      return await client.keys(pattern);
    } catch (error) {
      console.error("Redis KEYS error:", error);
      return [];
    }
  }

  /**
   * Clear all keys in the database (use with caution!)
   */
  async flushAll(): Promise<void> {
    try {
      const client = await this.ensureClient();
      await client.flushAll();
      console.log("⚠️ Redis: All keys cleared");
    } catch (error) {
      console.error("Redis FLUSH error:", error);
      throw new AppError(
        500,
        `Failed to flush Redis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Singleton instance
let redisServiceInstance: RedisService | null = null;

export const getRedisService = (): RedisService => {
  if (!redisServiceInstance) {
    redisServiceInstance = new RedisService();
  }
  return redisServiceInstance;
};

export default RedisService;
