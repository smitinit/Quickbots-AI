import { kv } from "@vercel/kv";
import lru from "./lru-instance";
import type { ApiKeyCache } from "@/types/cache.types";

export async function getCachedApiKey(
  hash: string
): Promise<ApiKeyCache | null> {
  const cacheKey = `apikey:${hash}`;

  if (process.env.NODE_ENV !== "production") {
    const cached = lru.get(cacheKey);
    return (cached as ApiKeyCache) ?? null;
  }

  const cached = await kv.get<ApiKeyCache>(cacheKey);
  return cached ?? null;
}

export async function setCachedApiKey(hash: string, data: ApiKeyCache) {
  const cacheKey = `apikey:${hash}`;

  if (process.env.NODE_ENV !== "production") {
    lru.set(cacheKey, data);
  } else {
    await kv.set(cacheKey, data, { ex: 60 * 5 }); // 5 min TTL
  }
}

export async function deleteCachedApiKey(hash: string) {
  const cacheKey = `apikey:${hash}`;

  if (process.env.NODE_ENV !== "production") {
    lru.delete(cacheKey);
  } else {
    await kv.del(cacheKey);
  }
}

