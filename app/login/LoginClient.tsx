"use client";

import { signIn } from "next-auth/react";
import { BookOpen, LogIn, ShieldCheck, GraduationCap, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoginClientProps {
  appName: string;
}

export default function LoginClient({ appName }: LoginClientProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 via-slate-50 to-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card-surface p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{appName}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Masuk untuk mengakses materi, tugas, kuis, dan nilai kelas Anda.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <LogIn className="h-4 w-4" />
            Masuk dengan Google
          </Button>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-brand-600" />
              <p className="text-xs font-medium text-slate-600">Owner</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <GraduationCap className="mx-auto mb-1 h-5 w-5 text-brand-600" />
              <p className="text-xs font-medium text-slate-600">Guru</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <MessagesSquare className="mx-auto mb-1 h-5 w-5 text-brand-600" />
              <p className="text-xs font-medium text-slate-600">Murid</p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Akses dibatasi untuk pengguna terdaftar. Hubungi administrator jika tidak dapat masuk.
          </p>
        </div>
      </div>
    </main>
  );
}
