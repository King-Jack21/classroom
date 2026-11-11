"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/rbac";
import { sendPublicMessage } from "@/lib/chat";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Kirim pesan ke Chat Publik — semua role (murid, guru, owner) boleh.
 * Validasi hanya memastikan pengguna login (requireUser), tanpa gating role.
 */
export async function sendPublicMessageAction(text: string): Promise<ActionResult> {
  const me = await requireUser();
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Pesan tidak boleh kosong." };

  const message = await sendPublicMessage(me.uid, trimmed);
  if (!message) return { ok: false, error: "Pesan gagal dikirim. Coba lagi." };

  await logActivity(me.uid, "pesan_publik", trimmed.slice(0, 80));
  revalidatePath("/chat");
  return { ok: true };
}
