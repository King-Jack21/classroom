import type { Metadata } from "next";
import { requireUser, roleHome } from "@/lib/rbac";
import { getDisplayName } from "@/lib/users";
import { getAppName } from "@/lib/app-name";
import AppShell from "@/components/AppShell";
import { LayoutDashboard, MessagesSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat Publik",
};

/**
 * Chat Publik dapat diakses SEMUA role (murid, guru, owner).
 * Layout hanya memakai requireUser() — tanpa gating role.
 */
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireUser();

  const navItems = [
    { href: roleHome(me.role), label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Chat Publik", icon: MessagesSquare },
  ];

  return (
    <AppShell
      navItems={navItems}
      appName={getAppName()}
      user={{ name: getDisplayName(me), image: me.image ?? null, email: me.email }}
    >
      {children}
    </AppShell>
  );
}
