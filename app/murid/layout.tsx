import type { Metadata } from "next";
import { requireRole } from "@/lib/rbac";
import { getDisplayName } from "@/lib/users";
import { getAppName } from "@/lib/app-name";
import AppShell from "@/components/AppShell";
import {
  Home,
  LibraryBig,
  Award,
  GraduationCap,
  Users,
  MessagesSquare,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Murid",
};

export default async function MuridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole("student");

  const navItems = [
    { href: "/murid", label: "Beranda", icon: Home },
    { href: "/murid/kelas", label: "Kelas", icon: LibraryBig },
    { href: "/murid/nilai", label: "Nilai", icon: Award },
    { href: "/murid/guru", label: "Guru", icon: GraduationCap },
    { href: "/murid/siswa", label: "Siswa", icon: Users },
    { href: "/chat", label: "Chat Publik", icon: MessagesSquare },
    { href: "/murid/profil", label: "Profil", icon: UserRound },
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
