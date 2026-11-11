import { redis } from "./redis";
import { getUserById, getDisplayName } from "./users";
import type { ChatMessage } from "./types";

const LOBBY_KEY = "chat:lobby";
const PUBLIC_KEY = "chat:public:messages";
const CHAT_MAX = 200;

async function pushMessage(key: string, uid: string, text: string): Promise<ChatMessage | null> {
  const user = await getUserById(uid);
  if (!user) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    uid,
    name: getDisplayName(user),
    role: user.role,
    image: user.image ?? null,
    text: trimmed.slice(0, 2000),
    createdAt: Date.now(),
  };
  await redis.lpush(key, message);
  await redis.ltrim(key, 0, CHAT_MAX - 1);
  return message;
}

async function listMessages(key: string, limit = 50): Promise<ChatMessage[]> {
  const items = await redis.lrange<ChatMessage>(key, 0, Math.max(0, limit - 1));
  return items ?? [];
}

/** Lobby guru + owner (pembatasan role dilakukan di pemanggil/layout). */
export function sendLobbyMessage(uid: string, text: string): Promise<ChatMessage | null> {
  return pushMessage(LOBBY_KEY, uid, text);
}

export function listLobbyMessages(limit?: number): Promise<ChatMessage[]> {
  return listMessages(LOBBY_KEY, limit ?? 50);
}

/** Chat publik untuk semua role (murid, guru, owner). */
export function sendPublicMessage(uid: string, text: string): Promise<ChatMessage | null> {
  return pushMessage(PUBLIC_KEY, uid, text);
}

export function listPublicMessages(limit?: number): Promise<ChatMessage[]> {
  return listMessages(PUBLIC_KEY, limit ?? 50);
}
