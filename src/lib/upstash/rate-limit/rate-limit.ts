import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// One Redis instance shared app-wide
const redis = Redis.fromEnv();

/**
 * Chat rate limit
 *  - 20 requests per minute per session
 *  - sliding window = smoother UX
 */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true, // enables dashboard graphs
  prefix: "ratelimit:chat",
});
