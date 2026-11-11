import { redis } from "./redis";
import type { Role, UserProfile } from "./types";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getDisplayName(u: Pick<UserProfile, "name" | "displayName">): string {
  const custom = u.displayName?.trim();
  return custom && custom.length > 0 ? custom : u.name;
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "teacher":
      return "Guru";
    case "student":
      return "Murid";
  }
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const uid = await redis.hget<string>("users:by-email", normalizeEmail(email));
  if (!uid) return null;
  return getUserById(uid);
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const raw = await redis.get<UserProfile>(`users:${uid}`);
  return raw ?? null;
}

export async function upsertGoogleUser(p: {
  uid: string;
  name: string;
  email: string;
  image?: string | null;
}): Promise<UserProfile> {
  const email = normalizeEmail(p.email);
  const ownerEmail = normalizeEmail(process.env.OWNER_EMAIL ?? "");
  const existing = await getUserByEmail(email);

  if (existing) {
    // User lama: pertahankan role, displayName, dan bio yang sudah diatur.
    const role: Role = ownerEmail && email === ownerEmail ? "owner" : existing.role;
    const updated: UserProfile = {
      ...existing,
      name: p.name || existing.name,
      email,
      image: p.image ?? existing.image ?? null,
      role,
    };
    await redis.set(`users:${existing.uid}`, updated);
    // Pastikan mapping email → uid tetap mengarah ke akun ini.
    await redis.hset("users:by-email", { [email]: existing.uid });
    return updated;
  }

  const role: Role = ownerEmail && email === ownerEmail ? "owner" : "student";
  const user: UserProfile = {
    uid: p.uid,
    name: p.name,
    email,
    image: p.image ?? null,
    role,
    createdAt: Date.now(),
  };
  await redis.set(`users:${p.uid}`, user);
  await redis.hset("users:by-email", { [email]: p.uid });
  await redis.sadd("users:index", p.uid);
  return user;
}

export async function listUsers(): Promise<UserProfile[]> {
  const uids = await redis.smembers<string[]>("users:index");
  if (!uids || uids.length === 0) return [];
  const users = await Promise.all(uids.map((uid) => getUserById(uid)));
  return users.filter((u): u is UserProfile => u !== null);
}

export async function setUserRole(
  uid: string,
  role: Role,
  actorUid: string,
): Promise<UserProfile | null> {
  const user = await getUserById(uid);
  if (!user) return null;
  const updated: UserProfile = { ...user, role };
  await redis.set(`users:${uid}`, updated);
  return updated;
}

export async function updateProfile(
  uid: string,
  patch: { displayName?: string; bio?: string },
): Promise<UserProfile | null> {
  const user = await getUserById(uid);
  if (!user) return null;
  const updated: UserProfile = {
    ...user,
    displayName: patch.displayName !== undefined ? patch.displayName.trim() : user.displayName,
    bio: patch.bio !== undefined ? patch.bio.trim() : user.bio,
  };
  await redis.set(`users:${uid}`, updated);
  return updated;
}

export async function countByRole(): Promise<Record<Role, number>> {
  const users = await listUsers();
  const counts: Record<Role, number> = { owner: 0, teacher: 0, student: 0 };
  for (const u of users) {
    counts[u.role] += 1;
  }
  return counts;
}
