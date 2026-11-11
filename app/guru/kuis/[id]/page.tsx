import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Timer, HelpCircle } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getQuiz, listQuizResults } from "@/lib/quizzes";
import { getClass } from "@/lib/classes";
import { getDisplayName } from "@/lib/users";
import { EmptyState } from "@/components/teacher/EmptyState";
import { formatDateTime } from "@/components/teacher/format";

export default async function GuruQuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("teacher", "owner");
  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  const cls = await getClass(quiz.classId);
  if (cls && cls.ownerId !== me.uid && me.role !== "owner") redirect("/guru");

  const results = await listQuizResults(id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <Link href={cls ? `/guru/kelas/${cls.id}` : "/guru/kelas"} className="text-sm font-medium text-teal-700 hover:underline">
          ← Kembali ke kelas
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{quiz.title}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" /> {quiz.questions.length} soal
          </span>
          {quiz.dueAt ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Tenggat: {formatDateTime(quiz.dueAt)}
            </span>
          ) : null}
          {quiz.timeLimitMin ? (
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" /> Batas waktu: {quiz.timeLimitMin} menit
            </span>
          ) : null}
        </div>
        {quiz.description ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{quiz.description}</p>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Hasil Siswa ({results.length})
        </h2>
        {results.length === 0 ? (
          <EmptyState title="Belum ada yang mengerjakan" description="Hasil kuis siswa akan muncul di sini setelah kuis dikerjakan." />
        ) : (
          <div className="space-y-3">
            {results.map((result) => {
              const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
              return (
                <div key={result.uid} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {result.user ? getDisplayName(result.user) : "Siswa"}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(result.submittedAt)}</p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700 ring-1 ring-teal-100">
                      {result.score}/{result.total} benar
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Skor: {percent}%</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
