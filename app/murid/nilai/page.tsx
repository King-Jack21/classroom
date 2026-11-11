import type { ReactNode } from "react";
import { Award, ClipboardList, HelpCircle, LibraryBig } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listJoinedClasses } from "@/lib/classes";
import { listAssignmentsByClass, getSubmission } from "@/lib/assignments";
import { listQuizzesByClass, getQuizResult } from "@/lib/quizzes";
import type { Classroom, Assignment, Quiz, Submission, QuizResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface ClassGradebook {
  cls: Classroom;
  rows: {
    assignment: Assignment;
    submission: Submission | null;
  }[];
  quizRows: {
    quiz: Quiz;
    result: QuizResult | null;
  }[];
  average: number | null;
}

export const metadata = { title: "Nilai" };

export default async function MuridNilaiPage() {
  const me = await requireRole("student");
  const classes = await listJoinedClasses(me.uid);

  const gradebooks: ClassGradebook[] = [];
  for (const cls of classes) {
    const assignments = await listAssignmentsByClass(cls.id);
    const quizzes = await listQuizzesByClass(cls.id);

    const rows = await Promise.all(
      assignments.map(async (assignment) => ({
        assignment,
        submission: await getSubmission(assignment.id, me.uid),
      })),
    );
    const quizRows = await Promise.all(
      quizzes.map(async (quiz) => ({
        quiz,
        result: await getQuizResult(quiz.id, me.uid),
      })),
    );

    const values: number[] = [];
    for (const row of rows) {
      if (row.submission?.grade != null) values.push(row.submission.grade);
    }
    for (const row of quizRows) {
      if (row.result && row.result.total > 0) {
        values.push((row.result.score / row.result.total) * 100);
      }
    }
    const average =
      values.length > 0
        ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
        : null;

    gradebooks.push({ cls, rows, quizRows, average });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Award className="h-5 w-5 text-brand-600" />
          Gradebook Nilai
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Nilai tugas dan kuis dari setiap kelas yang Anda ikuti.
        </p>
      </div>

      {gradebooks.length === 0 ? (
        <Card>
          <EmptyState
            icon={LibraryBig}
            title="Belum ada nilai"
            description="Ikuti kelas terlebih dahulu untuk melihat nilai tugas dan kuis."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {gradebooks.map(({ cls, rows, quizRows, average }) => (
            <Card key={cls.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle>{cls.name}</CardTitle>
                    <p className="mt-0.5 text-xs font-medium text-brand-700">{cls.subject}</p>
                  </div>
                  {average != null ? (
                    <Badge tone="brand">Rata-rata: {average}/100</Badge>
                  ) : (
                    <Badge tone="slate">Belum ada nilai</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Tugas */}
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Tugas
                  </p>
                  {rows.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada tugas.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {rows.map(({ assignment, submission }) => {
                        let badge: ReactNode;
                        if (!submission) {
                          badge = <Badge tone="amber">Belum dikumpulkan</Badge>;
                        } else if (submission.grade == null) {
                          badge = <Badge tone="slate">Menunggu nilai</Badge>;
                        } else {
                          badge = (
                            <Badge tone={submission.grade >= 75 ? "green" : "amber"}>
                              {submission.grade}/100
                            </Badge>
                          );
                        }
                        return (
                          <li key={assignment.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-slate-400">Bobot: {assignment.weight}</p>
                            </div>
                            {badge}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Kuis */}
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Kuis
                  </p>
                  {quizRows.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada kuis.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {quizRows.map(({ quiz, result }) => {
                        let badge: ReactNode;
                        if (!result) {
                          badge = <Badge tone="amber">Belum dikerjakan</Badge>;
                        } else {
                          const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                          badge = (
                            <Badge tone={pct >= 75 ? "green" : "amber"}>
                              {result.score}/{result.total} · {pct}%
                            </Badge>
                          );
                        }
                        return (
                          <li key={quiz.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                            <p className="truncate text-sm font-medium text-slate-800">{quiz.title}</p>
                            {badge}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
              }
