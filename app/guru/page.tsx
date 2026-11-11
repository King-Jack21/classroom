import Link from "next/link";
import { BookOpen, Users, ClipboardList, HelpCircle, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listClassesByOwner, listMembers } from "@/lib/classes";
import { listAssignmentsByClass } from "@/lib/assignments";
import { listQuizzesByClass } from "@/lib/quizzes";
import { StatCard } from "@/components/teacher/StatCard";
import { EmptyState } from "@/components/teacher/EmptyState";

export default async function GuruHomePage() {
  const me = await requireRole("teacher", "owner");
  const classes = await listClassesByOwner(me.uid);

  let studentCount = 0;
  let assignmentCount = 0;
  let quizCount = 0;
  for (const cls of classes) {
    const members = await listMembers(cls.id);
    studentCount += members.length;
    assignmentCount += (await listAssignmentsByClass(cls.id)).length;
    quizCount += (await listQuizzesByClass(cls.id)).length;
  }
  const latest = classes.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Beranda Guru</h1>
        <p className="text-sm text-slate-500">Ringkasan kelas, siswa, tugas, dan kuis yang Anda ampu.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Kelas" value={classes.length} icon={BookOpen} tone="teal" />
        <StatCard label="Siswa" value={studentCount} icon={Users} tone="emerald" />
        <StatCard label="Tugas" value={assignmentCount} icon={ClipboardList} tone="amber" />
        <StatCard label="Kuis" value={quizCount} icon={HelpCircle} tone="slate" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Kelas Terbaru</h2>
          <Link href="/guru/kelas" className="text-sm font-medium text-teal-700 hover:underline">
            Lihat semua
          </Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState
            title="Belum ada kelas"
            description="Buat kelas pertama Anda melalui menu Kelas."
          />
        ) : (
          <div className="space-y-3">
            {latest.map((cls) => (
              <Link
                key={cls.id}
                href={`/guru/kelas/${cls.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{cls.name}</p>
                    <p className="text-sm text-slate-500">{cls.subject}</p>
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
