import Link from "next/link";
import { LibraryBig, CheckCircle2, PlusCircle } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listJoinedClasses, listAllClasses } from "@/lib/classes";
import type { Classroom } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import JoinClassForm from "@/components/student/JoinClassForm";

export const metadata = { title: "Kelas" };

export default async function MuridKelasPage() {
  const me = await requireRole("student");
  const [joined, all] = await Promise.all([
    listJoinedClasses(me.uid),
    listAllClasses(),
  ]);
  const joinedIds = new Set(joined.map((c) => c.id));
  const available = all.filter((c) => !joinedIds.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Kelas Saya</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelas yang Anda ikuti dan kelas lain yang tersedia untuk diikuti.
        </p>
      </div>

      <JoinClassForm />

      {/* Kelas yang sudah diikuti */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Sudah Diikuti</h2>
        {joined.length === 0 ? (
          <Card>
            <EmptyState
              icon={LibraryBig}
              title="Belum mengikuti kelas apa pun"
              description="Masukkan kode invite 6 karakter dari guru Anda pada formulir di atas."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {joined.map((cls: Classroom) => (
              <Link key={cls.id} href={`/murid/kelas/${cls.id}`} className="block">
                <Card className="h-full transition-colors hover:border-brand-300">
                  <CardContent className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                      <Badge tone="green">
                        <CheckCircle2 className="h-3 w-3" />
                        Diikuti
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-brand-700">{cls.subject}</p>
                    {cls.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {cls.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Semua kelas tersedia */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Semua Kelas Tersedia</h2>
        {available.length === 0 ? (
          <Card>
            <EmptyState
              icon={PlusCircle}
              title="Tidak ada kelas baru"
              description="Belum ada kelas lain yang bisa diikuti saat ini."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {available.map((cls: Classroom) => (
              <Card key={cls.id} className="h-full">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                    <Badge tone="slate">Belum diikuti</Badge>
                  </div>
                  <p className="text-xs font-medium text-brand-700">{cls.subject}</p>
                  {cls.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {cls.description}
                    </p>
                  )}
                  <p className="pt-1 text-xs text-slate-400">
                    Gunakan kode invite kelas ini untuk bergabung.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
