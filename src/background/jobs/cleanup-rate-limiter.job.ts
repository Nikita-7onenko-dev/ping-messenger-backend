import { rateLimiter } from "@/rate-limiter/rateLimiter.js";

export function cleanupRateLimiterJob() {
  try {
    let count = 0;
    rateLimiter.rateMap.forEach((rateLimit, userId) => {
      if (rateLimit.resetAt.getTime() < Date.now()) {
        rateLimiter.rateMap.delete(userId);
        count++;
      }
    });
    console.log(
      `[Job] cleanupRateLimiter: completed; limits deleted: ${count}`,
    );
  } catch (err) {
    console.error("[Job] cleanupRateLimiter: failed", err);
  }
}
