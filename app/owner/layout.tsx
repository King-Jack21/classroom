import { requireRole } from "@/lib/rbac";
import AppShell, { type NavItem } from "@/components/AppShell";
import { getDisplayName } from "@/lib/users";
import { getAppName } from "@/lib/app-name";
import { Home, UserRound, MessagesSquare, MessagesSquare as LobbyIcon } from "lucide-react";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("owner");

  const navItems: NavItem[] = [
    { href: "/owner", label: "Beranda", icon: Home },
    { href: "/guru/lobby", label: "Lobby Guru", icon: LobbyIcon },
    { href: "/chat", label: "Chat Publik", icon: MessagesSquare },
    { href: "/owner/profil", label: "Profil", icon: UserRound },
  ];

  return (
    <AppShell
      navItems={navItems}
      appName={getAppName()}
      user={{ name: getDisplayName(user), image: user.image, email: user.email }}
    >
      {children}
    </AppShell>
  );
}
