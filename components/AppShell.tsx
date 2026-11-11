"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { DEFAULT_APP_NAME } from "@/lib/app-name";
import { Avatar } from "@/components/ui/Avatar";
import LogoutButton from "@/components/LogoutButton";

export interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface AppShellProps {
  navItems?: NavItem[];
  appName?: string;
  user?: { name?: string | null; image?: string | null; email?: string | null };
  children: React.ReactNode;
}

export default function AppShell({ navItems = [], appName, user, children }: AppShellProps) {
  const pathname = usePathname();
  const resolvedName = appName?.trim() || DEFAULT_APP_NAME;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              V
            </span>
            <span className="truncate text-base font-bold text-slate-900">{resolvedName}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Avatar src={user?.image ?? null} name={user?.name ?? "Pengguna"} size={36} />
            <LogoutButton />
          </div>
        </div>
        {navItems.length > 0 && (
          <nav className="border-t border-slate-100">
            <div className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-2 py-2 sm:px-4">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && item.href !== "/owner" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>
      <main className="app-container">{children}</main>
    </div>
  );
}
