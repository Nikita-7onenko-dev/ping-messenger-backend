import { ApiError } from "@/exceptions/ApiError.js";

type RateLimit = {
  count: number;
  resetAt: Date;
};

class RateLimiter {
  rateMap: Map<string, RateLimit>;
  constructor() {
    this.rateMap = new Map();
  }

  check(userId: string, limit: number, windowMs: number = 15 * 60 * 1000) {
    if (this.rateMap.has(userId)) {
      const rateLimit = this.rateMap.get(userId)!;
      const resetTimeExpired = rateLimit.resetAt.getTime() < Date.now();

      if (!resetTimeExpired && rateLimit.count >= limit) {
        throw ApiError.forbidden("RATE_LIMIT_EXCEEDED");
      }

      let newRateLimit;
      if (resetTimeExpired) {
        newRateLimit = {
          count: 1,
          resetAt: new Date(Date.now() + windowMs),
        };
      } else {
        newRateLimit = {
          count: rateLimit.count + 1,
          resetAt: rateLimit.resetAt,
        };
      }

      this.rateMap.set(userId, newRateLimit);
    } else {
      this.rateMap.set(userId, {
        count: 1,
        resetAt: new Date(Date.now() + windowMs),
      });
    }
  }

  reset(userId: string) {
    this.rateMap.delete(userId);
  }
}

const rateLimiter = new RateLimiter();
export { rateLimiter };
