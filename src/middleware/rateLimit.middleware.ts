import { Request, Response, NextFunction } from "express";
import { getCacheService } from "../services/cache.service";
import { AppError } from "../utils/errors";

interface RateLimitOptions {
  windowSeconds: number; // Time window in seconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Rate limiting middleware using Redis
 * Limits requests per IP address (or custom identifier)
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const {
    windowSeconds,
    maxRequests,
    keyGenerator = (req) => req.ip || req.socket.remoteAddress || "unknown",
  } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cacheService = getCacheService();
      const identifier = keyGenerator(req);

      // Check rate limit
      const allowed = await cacheService.checkRateLimit(
        identifier,
        maxRequests,
        windowSeconds
      );

      if (!allowed) {
        // Get remaining info
        const { remaining, resetIn } = await cacheService.getRateLimitRemaining(
          identifier,
          maxRequests
        );

        res.status(429).json({
          success: false,
          message: "Too many requests, please try again later",
          retryAfter: resetIn,
        });
        return;
      }

      // Add rate limit headers
      const { remaining, resetIn } = await cacheService.getRateLimitRemaining(
        identifier,
        maxRequests
      );

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", Date.now() + resetIn * 1000);

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      // On error, allow the request
      next();
    }
  };
};

/**
 * Rate limit by user ID (requires authentication)
 */
export const rateLimitByUser = (options: RateLimitOptions) => {
  return rateLimiter({
    ...options,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id;
      return userId ? `user:${userId}` : req.ip || "unknown";
    },
  });
};

/**
 * Predefined rate limiters
 */

// Strict rate limit: 10 requests per minute
export const strictRateLimit = rateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
});

// Standard rate limit: 100 requests per minute
export const standardRateLimit = rateLimiter({
  windowSeconds: 60,
  maxRequests: 100,
});

// Login rate limit: 5 attempts per 15 minutes
export const loginRateLimit = rateLimiter({
  windowSeconds: 900, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => `login:${req.ip || "unknown"}`,
});
