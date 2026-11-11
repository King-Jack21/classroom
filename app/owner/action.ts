"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { getUserById, setUserRole, updateProfile, getDisplayName, roleLabel } from "@/lib/users";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok: boolean; error?: string };

export async function changeRole(
  uid: string,
  targetRole: "teacher" | "student",
): Promise<void> {
  const actor = await requireRole("owner");
  const target = await getUserById(uid);
  if (!target || target.role === "owner" || target.role === targetRole) {
    return;
  }

  await setUserRole(uid, targetRole, actor.uid);
  await logActivity(
    actor.uid,
    "role_diubah",
    `${getDisplayName(target)}: ${roleLabel(target.role)} → ${roleLabel(targetRole)}`,
  );
  revalidatePath("/owner");
}

export async function updateProfileAction(
  displayName: string,
  bio: string,
): Promise<ActionResult> {
  const actor = await requireRole("owner");
  const updated = await updateProfile(actor.uid, { displayName, bio });
  if (!updated) {
    return { ok: false, error: "Gagal memperbarui profil. Coba lagi." };
  }
  revalidatePath("/owner/profil");
  revalidatePath("/owner");
  return { ok: true };
}
  
