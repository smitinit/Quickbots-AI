import { kv } from "@vercel/kv";
import lru from "./lru-instance";
import type { BotProfile } from "@/types/cache.types";

const getCacheKey = (botId: string) => `bot_profile:${botId}`;

/* ── Get cached bot profile ───────────────────────────── */
export async function getCachedBotProfile(
  botId: string
): Promise<BotProfile | null> {
  const cacheKey = getCacheKey(botId);

  if (process.env.NODE_ENV !== "production") {
    const cached = lru.get(cacheKey);
    if (cached && isBotProfile(cached)) return cached;
    return null;
  }

  const cached = await kv.get<BotProfile>(cacheKey);
  return cached ?? null;
}

/* ── Set bot profile in cache ─────────────────────────── */
export async function setCachedBotProfile(botId: string, profile: BotProfile) {
  const cacheKey = getCacheKey(botId);

  if (process.env.NODE_ENV !== "production") {
    lru.set(cacheKey, profile);
  } else {
    await kv.set(cacheKey, profile, { ex: 60 * 5 }); // 5 min TTL
  }
}

/* ── Delete bot profile from cache ────────────────────── */
export async function deleteCachedBotProfile(botId: string) {
  const cacheKey = getCacheKey(botId);

  if (process.env.NODE_ENV !== "production") {
    lru.delete(cacheKey);
  } else {
    await kv.del(cacheKey);
  }
}

interface BotProfileLike {
  config: unknown;
  runtime_settings: unknown;
  settings: unknown;
  fetchedAt: string;
}

function isBotProfile(obj: unknown): obj is BotProfile {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "config" in obj &&
    "runtime_settings" in obj &&
    "settings" in obj &&
    typeof (obj as BotProfileLike).fetchedAt === "string"
  );
}

