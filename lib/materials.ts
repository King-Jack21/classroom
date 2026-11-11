import { redis } from "@/lib/redis";
import type { Attachment, Material } from "@/lib/types";
import { pushFeedItem, listFeed } from "@/lib/feed";

const MATERIAL_KEY = (id: string) => `feed:${id}`;

function genId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `mat_${Date.now().toString(36)}${rand}`;
}

export async function createMaterial(input: {
  classId: string;
  authorId: string;
  title: string;
  body: string;
  attachments: Attachment[];
}): Promise<Material> {
  const id = genId();
  const material: Material = {
    id,
    kind: "material",
    classId: input.classId,
    authorId: input.authorId,
    title: input.title.trim(),
    body: input.body.trim(),
    attachments: input.attachments ?? [],
    createdAt: Date.now(),
  };
  await redis.set(MATERIAL_KEY(id), material);
  await pushFeedItem(input.classId, id);
  return material;
}

export async function getMaterial(id: string): Promise<Material | null> {
  return redis.get<Material>(MATERIAL_KEY(id));
}

export async function listMaterialsByClass(classId: string): Promise<Material[]> {
  const items = await listFeed(classId);
  return items.filter((item): item is Material => item.kind === "material");
}
