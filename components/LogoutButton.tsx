"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Keluar dari akun"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Keluar</span>
    </Button>
  );
}
