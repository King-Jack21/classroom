import { redis } from "@/lib/redis";
import type { FeedItem } from "@/lib/types";

const FEED_INDEX_KEY = (classId: string) => `class:feed:${classId}`;
const FEED_ITEM_KEY = (itemId: string) => `feed:${itemId}`;

/** Menambahkan item feed ke daftar kelas (LIST lama→baru). */
export async function pushFeedItem(classId: string, itemId: string): Promise<void> {
  await redis.rpush(FEED_INDEX_KEY(classId), itemId);
}

/** Mengambil seluruh item feed kelas, di-hydrate, urut terbaru lebih dulu. */
export async function listFeed(classId: string): Promise<FeedItem[]> {
  const ids = await redis.lrange<string>(FEED_INDEX_KEY(classId), 0, -1);
  const items = await Promise.all(ids.map((id) => redis.get<FeedItem>(FEED_ITEM_KEY(id))));
  return items
    .filter((item): item is FeedItem => item !== null)
    .reverse();
}
