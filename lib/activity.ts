import { redis } from "./redis";
import { getUserById, getDisplayName } from "./users";
import type { ActivityEntry } from "./types";

const ACTIVITY_KEY = "activity:log";
const ACTIVITY_MAX = 500;

export async function logActivity(uid: string, action: string, detail?: string): Promise<void> {
  const user = await getUserById(uid);
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    uid,
    name: user ? getDisplayName(user) : "Pengguna",
    action,
    detail,
    createdAt: Date.now(),
  };
  await redis.lpush(ACTIVITY_KEY, entry);
  await redis.ltrim(ACTIVITY_KEY, 0, ACTIVITY_MAX - 1);
}

export async function listActivity(limit = 20): Promise<ActivityEntry[]> {
  const items = await redis.lrange<ActivityEntry>(ACTIVITY_KEY, 0, Math.max(0, limit - 1));
  return items ?? [];
}
