import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, Paperclip, CalendarDays, Scale } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getAssignment, listSubmissions } from "@/lib/assignments";
import { getClass } from "@/lib/classes";
import { getDisplayName } from "@/lib/users";
import { SubmissionGradeForm } from "@/components/teacher/SubmissionGradeForm";
import { EmptyState } from "@/components/teacher/EmptyState";
import { formatDateTime, formatBytes } from "@/components/teacher/format";

export default async function GuruAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("teacher", "owner");
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const cls = await getClass(assignment.classId);
  if (cls && cls.ownerId !== me.uid && me.role !== "owner") redirect("/guru");

  const submissions = await listSubmissions(id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <Link href={cls ? `/guru/kelas/${cls.id}` : "/guru/kelas"} className="text-sm font-medium text-teal-700 hover:underline">
          ← Kembali ke kelas
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{assignment.title}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {assignment.dueAt ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Tenggat: {formatDateTime(assignment.dueAt)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" /> Bobot nilai: {assignment.weight}
          </span>
        </div>
        {assignment.description ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{assignment.description}</p>
        ) : null}
        {assignment.attachments.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {assignment.attachments.map((file) => (
              <li key={file.url} className="flex items-center gap-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-teal-700 hover:underline">
                  {file.name}
                </a>
                <span className="text-xs text-slate-400">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Pengumpulan Siswa ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <EmptyState title="Belum ada pengumpulan" description="Pengumpulan siswa akan muncul di sini setelah tugas dikumpulkan." />
        ) : (
          submissions.map((submission) => (
            <div key={submission.uid} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {submission.user ? getDisplayName(submission.user) : "Siswa"}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {formatDateTime(submission.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {submission.late ? (
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                      Terlambat
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      Tepat Waktu
                    </span>
                  )}
                  {submission.grade != null ? (
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                      Nilai: {submission.grade}/100
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Belum Dinilai
                    </span>
                  )}
                </div>
              </div>

              {submission.text ? (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {submission.text}
                </p>
              ) : null}

              {submission.attachments.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {submission.attachments.map((file) => (
                    <li key={file.url} className="flex items-center gap-2 text-sm">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-teal-700 hover:underline">
                        {file.name}
                      </a>
                      <span className="text-xs text-slate-400">{formatBytes(file.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {submission.feedback ? (
                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <span className="font-semibold">Komentar guru:</span> {submission.feedback}
                </p>
              ) : null}

              {submission.grade == null ? (
                <div className="mt-3">
                  <SubmissionGradeForm assignmentId={assignment.id} uid={submission.uid} />
                </div>
              ) : null}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
