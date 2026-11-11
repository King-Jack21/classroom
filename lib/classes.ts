import { redis } from "@/lib/redis";
import type { Classroom, UserProfile } from "@/lib/types";
import { getUserById } from "@/lib/users";

const CLASS_KEY = (id: string) => `classes:${id}`;
const INDEX_KEY = "classes:index";
const MEMBERS_KEY = (classId: string) => `class:members:${classId}`;
const FEED_KEY = (classId: string) => `class:feed:${classId}`;

function genId(prefix: string): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** 6 karakter huruf besar + angka; dipastikan unik di antara kelas yang ada. */
export function genInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueInviteCode(): Promise<string> {
  const existing = await listAllClasses();
  const used = new Set(existing.map((c) => c.inviteCode));
  let code = genInviteCode();
  while (used.has(code)) {
    code = genInviteCode();
  }
  return code;
}

export async function createClass(input: {
  name: string;
  subject: string;
  description: string;
  ownerId: string;
}): Promise<Classroom> {
  const id = genId("cls");
  const inviteCode = await uniqueInviteCode();
  const classroom: Classroom = {
    id,
    name: input.name.trim(),
    subject: input.subject.trim(),
    description: input.description.trim(),
    ownerId: input.ownerId,
    inviteCode,
    createdAt: Date.now(),
  };
  await redis.set(CLASS_KEY(id), classroom);
  await redis.sadd(INDEX_KEY, id);
  return classroom;
}

export async function getClass(id: string): Promise<Classroom | null> {
  return redis.get<Classroom>(CLASS_KEY(id));
}

export async function listAllClasses(): Promise<Classroom[]> {
  const ids = await redis.smembers<string[]>(INDEX_KEY);
  const classes = await Promise.all(ids.map((id) => redis.get<Classroom>(CLASS_KEY(id))));
  return classes
    .filter((c): c is Classroom => c !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function listClassesByOwner(ownerId: string): Promise<Classroom[]> {
  const all = await listAllClasses();
  return all.filter((c) => c.ownerId === ownerId);
}

export async function listJoinedClassIds(uid: string): Promise<string[]> {
  const all = await listAllClasses();
  const result: string[] = [];
  for (const cls of all) {
    const isMember = await redis.sismember(MEMBERS_KEY(cls.id), uid);
    if (isMember) result.push(cls.id);
  }
  return result;
}

export async function listJoinedClasses(uid: string): Promise<Classroom[]> {
  const ids = await listJoinedClassIds(uid);
  const classes = await Promise.all(ids.map((id) => getClass(id)));
  return classes.filter((c): c is Classroom => c !== null);
}

export async function joinClassByCode(
  code: string,
  uid: string,
): Promise<{ ok: boolean; reason?: string; classroom?: Classroom }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Kode kelas tidak boleh kosong." };
  const all = await listAllClasses();
  const target = all.find((c) => c.inviteCode === normalized);
  if (!target) return { ok: false, reason: "Kode kelas tidak ditemukan." };
  const already = await redis.sismember(MEMBERS_KEY(target.id), uid);
  if (already) {
    return { ok: true, classroom: target, reason: "Anda sudah bergabung di kelas ini." };
  }
  await redis.sadd(MEMBERS_KEY(target.id), uid);
  return { ok: true, classroom: target };
}

export async function listMembers(classId: string): Promise<UserProfile[]> {
  const uids = await redis.smembers<string[]>(MEMBERS_KEY(classId));
  const users = await Promise.all(uids.map((uid) => getUserById(uid)));
  return users.filter((u): u is UserProfile => u !== null);
}

export async function updateClass(
  id: string,
  patch: Partial<Pick<Classroom, "name" | "subject" | "description">>,
): Promise<Classroom | null> {
  const existing = await getClass(id);
  if (!existing) return null;
  const updated: Classroom = {
    ...existing,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    subject: patch.subject !== undefined ? patch.subject.trim() : existing.subject,
    description:
      patch.description !== undefined ? patch.description.trim() : existing.description,
  };
  await redis.set(CLASS_KEY(id), updated);
  return updated;
}

export async function deleteClass(id: string): Promise<void> {
  await redis.del(CLASS_KEY(id));
  await redis.srem(INDEX_KEY, id);
  await redis.del(MEMBERS_KEY(id));
  await redis.del(FEED_KEY(id));
}
