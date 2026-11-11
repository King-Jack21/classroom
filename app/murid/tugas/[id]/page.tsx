import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ClipboardList,
  Clock,
  Weight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Star,
  MessageSquare,
  FileText,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getAssignment, getSubmission } from "@/lib/assignments";
import { getClass, listMembers } from "@/lib/classes";
import type { Submission } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import AttachmentList from "@/components/AttachmentList";
import DateTime from "@/components/DateTime";
import SubmissionForm from "@/components/student/SubmissionForm";

export const metadata: Metadata = { title: "Detail Tugas" };

interface StatusInfo {
  label: string;
  tone: BadgeTone;
}

function statusOf(submission: Submission | null): StatusInfo {
  if (!submission) return { label: "Belum", tone: "amber" };
  if (submission.late) return { label: "Terlambat", tone: "red" };
  return { label: "Terkumpul", tone: "green" };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("student");

  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  const cls = await getClass(assignment.classId);
  const members = await listMembers(assignment.classId);
  if (!members.some((member) => member.uid === me.uid)) {
    redirect("/murid/kelas");
  }

  const submission = await getSubmission(assignment.id, me.uid);
  const status = statusOf(submission);
  const overdue = assignment.dueAt != null && Date.now() > assignment.dueAt && !submission;

  return (
    <div className="space-y-5">
      <Link
        href={`/murid/kelas/${assignment.classId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kelas{cls ? `: ${cls.name}` : ""}
      </Link>

      {/* Detail tugas dari guru */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-brand-600" />
                {assignment.title}
              </CardTitle>
              {cls && (
                <p className="mt-1 text-xs text-slate-500">Kelas: {cls.name}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="slate">Tugas</Badge>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {assignment.dueAt ? (
                <>
                  Tenggat: <DateTime value={assignment.dueAt} />
                </>
              ) : (
                "Tanpa tenggat"
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Weight className="h-3.5 w-3.5" />
              Bobot nilai: {assignment.weight}
            </span>
          </div>

          {overdue && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Tenggat pengumpulan telah lewat.
            </p>
          )}

          {assignment.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {assignment.description}
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lampiran Guru
            </p>
            <AttachmentList
              attachments={assignment.attachments}
              emptyText="Tidak ada lampiran dari guru."
            />
          </div>
        </CardContent>
      </Card>

      {/* Hasil pengumpulan atau form pengumpulan */}
      {submission ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Pengumpulan Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={submission.late ? "red" : "green"}>
                {submission.late ? "Terlambat" : "Tepat Waktu"}
              </Badge>
              <span className="text-xs text-slate-500">
                Dikumpulkan: <DateTime value={submission.submittedAt} />
              </span>
            </div>

            {submission.text && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jawaban Saya
                </p>
                <p className="whitespace-pre-wrap rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-700">
                  {submission.text}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lampiran Saya
              </p>
              <AttachmentList
                attachments={submission.attachments}
                emptyText="Tidak ada lampiran yang dikumpulkan."
              />
            </div>

            {submission.grade != null ? (
              <div className="rounded-xl bg-brand-50 px-4 py-3.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-800">
                  <Star className="h-4 w-4" />
                  Nilai
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-900">
                  {submission.grade}
                  <span className="text-sm font-medium text-brand-700"> / 100</span>
                </p>
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                <FileText className="h-4 w-4" />
                Nilai dari guru belum diberikan.
              </p>
            )}

            {submission.feedback && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MessageSquare className="h-4 w-4" />
                  Komentar Guru
                </p>
                <p className="whitespace-pre-wrap rounded-xl bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900">
                  {submission.feedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <SubmissionForm assignmentId={assignment.id} dueAt={assignment.dueAt} />
      )}
    </div>
  );
}
