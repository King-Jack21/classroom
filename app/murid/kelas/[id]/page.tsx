import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookOpen, FileText, ClipboardList, HelpCircle, Users } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getClass, listMembers } from "@/lib/classes";
import { listMaterialsByClass } from "@/lib/materials";
import { listAssignmentsByClass, getSubmission } from "@/lib/assignments";
import { listQuizzesByClass, getQuizResult } from "@/lib/quizzes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import FeedItemCard, { type FeedStatus } from "@/components/student/FeedItemCard";

export const metadata: Metadata = { title: "Detail Kelas" };

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("student");

  const cls = await getClass(id);
  if (!cls) notFound();

  // Validasi server: hanya anggota kelas yang boleh melihat feed.
  const members = await listMembers(id);
  if (!members.some((member) => member.uid === me.uid)) {
    redirect("/murid/kelas");
  }

  const materials = await listMaterialsByClass(id);
  const assignments = await listAssignmentsByClass(id);
  const quizzes = await listQuizzesByClass(id);

  const assignmentStatuses = new Map<string, FeedStatus>();
  for (const assignment of assignments) {
    const submission = await getSubmission(assignment.id, me.uid);
    if (!submission) {
      assignmentStatuses.set(assignment.id, { label: "Belum", tone: "amber" });
    } else if (submission.late) {
      assignmentStatuses.set(assignment.id, { label: "Terlambat", tone: "red" });
    } else {
      assignmentStatuses.set(assignment.id, { label: "Terkumpul", tone: "green" });
    }
  }

  const quizStatuses = new Map<string, FeedStatus>();
  for (const quiz of quizzes) {
    const result = await getQuizResult(quiz.id, me.uid);
    quizStatuses.set(
      quiz.id,
      result ? { label: "Selesai", tone: "green" } : { label: "Belum", tone: "amber" },
    );
  }

  return (
    <div className="space-y-6">
      {/* Info kelas */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-600" />
                {cls.name}
              </CardTitle>
              <p className="mt-1 text-sm font-medium text-brand-700">{cls.subject}</p>
            </div>
            <Badge tone="slate">
              <Users className="h-3 w-3" />
              {members.length} anggota
            </Badge>
          </div>
        </CardHeader>
        {cls.description && (
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {cls.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Tugas */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ClipboardList className="h-4 w-4 text-brand-600" />
          Tugas
        </h2>
        {assignments.length === 0 ? (
          <Card>
            <EmptyState icon={ClipboardList} title="Belum ada tugas" />
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                href={`/murid/tugas/${item.id}`}
                status={assignmentStatuses.get(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Kuis */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <HelpCircle className="h-4 w-4 text-brand-600" />
          Kuis
        </h2>
        {quizzes.length === 0 ? (
          <Card>
            <EmptyState icon={HelpCircle} title="Belum ada kuis" />
          </Card>
        ) : (
          <div className="space-y-3">
            {quizzes.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                href={`/murid/kuis/${item.id}`}
                status={quizStatuses.get(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Materi */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <FileText className="h-4 w-4 text-brand-600" />
          Materi
        </h2>
        {materials.length === 0 ? (
          <Card>
            <EmptyState icon={FileText} title="Belum ada materi" />
          </Card>
        ) : (
          <div className="space-y-3">
            {materials.map((item) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
                }
