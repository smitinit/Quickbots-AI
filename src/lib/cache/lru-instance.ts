import type { ApiKeyCache, BotProfile } from "@/types/cache.types";
import { LRUCache } from "lru-cache";

type CacheValue = ApiKeyCache | BotProfile;

// ─────────────────────────────
// GLOBAL LRU HOLDER
// ─────────────────────────────
declare global {
  var __global_lru_cache__: LRUCache<string, CacheValue> | undefined;
}

const lru =
  global.__global_lru_cache__ ??
  new LRUCache<string, CacheValue>({
    max: 1000,
    ttl: 0, // no automatic TTL unless you want it
  });

if (!global.__global_lru_cache__) {
  global.__global_lru_cache__ = lru;
}

export default lru;

