import type { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";
import AppShell from "@/components/AppShell";
import { getAppName } from "@/lib/app-name";

const navItems = [
  { href: "/guru", label: "Beranda" },
  { href: "/guru/kelas", label: "Kelas" },
  { href: "/guru/siswa", label: "Siswa" },
  { href: "/guru/lobby", label: "Lobby Guru" },
  { href: "/chat", label: "Chat Publik" },
  { href: "/guru/profil", label: "Profil" },
];

export default async function GuruLayout({ children }: { children: ReactNode }) {
  await requireRole("teacher", "owner");
  return <AppShell navItems={navItems} appName={getAppName()}>{children}</AppShell>;
}
