import { createClient, RedisClientType } from "redis";
import { config } from "./env.config";

class RedisConfig {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  /**
   * Get Redis client instance (singleton)
   */
  async getClient(): Promise<RedisClientType> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      // Create Redis client
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("❌ Redis: Too many reconnection attempts");
              return new Error("Too many retries");
            }
            // Exponential backoff: 50ms, 100ms, 200ms, 400ms...
            return Math.min(retries * 50, 3000);
          },
        },
      });

      // Error handler
      this.client.on("error", (err) => {
        console.error("❌ Redis Client Error:", err.message);
        this.isConnected = false;
      });

      // Connection handler
      this.client.on("connect", () => {
        console.log("🔄 Redis: Connecting...");
      });

      this.client.on("ready", () => {
        console.log("✅ Redis: Connected successfully");
        this.isConnected = true;
      });

      this.client.on("end", () => {
        console.log("⚠️ Redis: Connection closed");
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();

      return this.client;
    } catch (error) {
      console.error("❌ Redis Connection Error:", error);
      throw error;
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      console.log("🔴 Redis: Disconnected");
    }
  }

  /**
   * Ping Redis to check health
   */
  async ping(): Promise<boolean> {
    try {
      const client = await this.getClient();
      const result = await client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("❌ Redis Ping Failed:", error);
      return false;
    }
  }
}

// Singleton instance
let redisConfigInstance: RedisConfig | null = null;

export const getRedisConfig = (): RedisConfig => {
  if (!redisConfigInstance) {
    redisConfigInstance = new RedisConfig();
  }
  return redisConfigInstance;
};

// Export for convenience
export const getRedisClient = async (): Promise<RedisClientType> => {
  const redisConfig = getRedisConfig();
  return redisConfig.getClient();
};

export default RedisConfig;
