import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listClassesByOwner, listMembers } from "@/lib/classes";
import { ClassForm } from "@/components/teacher/ClassForm";
import { EmptyState } from "@/components/teacher/EmptyState";

export default async function GuruKelasPage() {
  const me = await requireRole("teacher", "owner");
  const classes = await listClassesByOwner(me.uid);
  const rows = await Promise.all(
    classes.map(async (cls) => ({
      cls,
      memberCount: (await listMembers(cls.id)).length,
    })),
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Kelas Saya</h1>
        <p className="text-sm text-slate-500">Kelola kelas yang Anda ajarkan.</p>
      </div>

      <ClassForm />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Daftar Kelas</h2>
        {rows.length === 0 ? (
          <EmptyState title="Belum ada kelas" description="Gunakan formulir di atas untuk membuat kelas baru." />
        ) : (
          <div className="space-y-3">
            {rows.map(({ cls, memberCount }) => (
              <Link
                key={cls.id}
                href={`/guru/kelas/${cls.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{cls.name}</p>
                    <p className="text-sm text-slate-500">{cls.subject}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5" /> {memberCount} siswa terdaftar
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
