import { OdooUser } from "../types/odoo.types";
import { getRedisService } from "./redis.service";

/**
 * Cache Service - High-level caching operations
 * Wraps Redis service with business logic
 */
class CacheService {
  private redis = getRedisService();

  // Cache key prefixes
  private readonly PREFIXES = {
    USER: "user:",
    USERS_ALL: "users:all",
    USERS_ACTIVE: "users:active",
    SESSION: "session:",
    TOKEN_BLACKLIST: "token:blacklist:",
  };

  // Default TTL values (in seconds)
  private readonly TTL = {
    USER: 3600, // 1 hour
    USERS_LIST: 300, // 5 minutes
    SESSION: 86400, // 24 hours
    TOKEN_BLACKLIST: 604800, // 7 days
  };

  // ==========================================
  // USER CACHING
  // ==========================================

  /**
   * Cache a single user
   */
  async cacheUser(user: OdooUser): Promise<void> {
    const key = `${this.PREFIXES.USER}${user.id}`;
    await this.redis.set(key, user, this.TTL.USER);
  }

  /**
   * Get cached user by ID
   */
  async getCachedUser(userId: number): Promise<OdooUser | null> {
    const key = `${this.PREFIXES.USER}${userId}`;
    return await this.redis.get<OdooUser>(key);
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: number): Promise<void> {
    const key = `${this.PREFIXES.USER}${userId}`;
    await this.redis.delete(key);
  }

  /**
   * Cache all users list
   */
  async cacheAllUsers(users: OdooUser[]): Promise<void> {
    await this.redis.set(this.PREFIXES.USERS_ALL, users, this.TTL.USERS_LIST);
  }

  /**
   * Get cached users list
   */
  async getCachedAllUsers(): Promise<OdooUser[] | null> {
    return await this.redis.get<OdooUser[]>(this.PREFIXES.USERS_ALL);
  }

  /**
   * Cache active users list
   */
  async cacheActiveUsers(users: OdooUser[]): Promise<void> {
    await this.redis.set(
      this.PREFIXES.USERS_ACTIVE,
      users,
      this.TTL.USERS_LIST
    );
  }

  /**
   * Get cached active users
   */
  async getCachedActiveUsers(): Promise<OdooUser[] | null> {
    return await this.redis.get<OdooUser[]>(this.PREFIXES.USERS_ACTIVE);
  }

  /**
   * Invalidate all user-related caches
   */
  async invalidateAllUserCaches(): Promise<void> {
    await this.redis.deleteByPattern("user:*");
    await this.redis.deleteByPattern("users:*");
  }

  // ==========================================
  // TOKEN BLACKLIST (for JWT revocation)
  // ==========================================

  /**
   * Add token to blacklist (for logout)
   */
  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = `${this.PREFIXES.TOKEN_BLACKLIST}${token}`;
    await this.redis.set(key, { blacklisted: true }, expiresIn);
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.PREFIXES.TOKEN_BLACKLIST}${token}`;
    return await this.redis.exists(key);
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  /**
   * Store user session
   */
  async setSession(
    sessionId: string,
    userId: number,
    data?: any
  ): Promise<void> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    await this.redis.set(
      key,
      { userId, ...data, createdAt: Date.now() },
      this.TTL.SESSION
    );
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    return await this.redis.get(key);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    await this.redis.delete(key);
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: number): Promise<number> {
    const pattern = `${this.PREFIXES.SESSION}*`;
    const keys = await this.redis.keys(pattern);

    let deletedCount = 0;
    for (const key of keys) {
      const session = await this.redis.get(key);
      if (session && session.userId === userId) {
        await this.redis.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // ==========================================
  // RATE LIMITING
  // ==========================================

  /**
   * Check and increment rate limit counter
   * @returns true if allowed, false if rate limit exceeded
   */
  async checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<boolean> {
    const key = `ratelimit:${identifier}`;

    try {
      const current = await this.redis.increment(key);

      if (current === 1) {
        // First request in window, set expiration
        await this.redis.expire(key, windowSeconds);
      }

      return current <= maxRequests;
    } catch (error) {
      console.error("Rate limit check error:", error);
      // On error, allow the request
      return true;
    }
  }

  /**
   * Get remaining rate limit
   */
  async getRateLimitRemaining(
    identifier: string,
    maxRequests: number
  ): Promise<{ remaining: number; resetIn: number }> {
    const key = `ratelimit:${identifier}`;
    const current = (await this.redis.get<number>(key)) || 0;
    const ttl = await this.redis.ttl(key);

    return {
      remaining: Math.max(0, maxRequests - current),
      resetIn: ttl > 0 ? ttl : 0,
    };
  }

  // ==========================================
  // GENERIC CACHE OPERATIONS
  // ==========================================

  /**
   * Generic cache get with fallback
   * If cache miss, execute fetchFunction and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch data
    const data = await fetchFunction();

    // Cache the result
    await this.redis.set(key, data, ttlSeconds);

    return data;
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    await this.redis.flushAll();
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export const getCacheService = (): CacheService => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
};

export default CacheService;
