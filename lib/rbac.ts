import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "./users";
import type { Role, UserProfile } from "./types";

export function roleHome(role: Role): string {
  switch (role) {
    case "owner":
      return "/owner";
    case "teacher":
      return "/guru";
    case "student":
      return "/murid";
  }
}

export async function requireUser(): Promise<UserProfile> {
  const session = await auth();
  const uid = (session?.user as { uid?: string } | undefined)?.uid;
  if (!session || !uid) redirect("/login");
  const user = await getUserById(uid);
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<UserProfile> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }
  return user;
}
