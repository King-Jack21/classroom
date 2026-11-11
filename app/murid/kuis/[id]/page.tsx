import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  HelpCircle,
  Clock,
  ArrowLeft,
  Award,
  Check,
  X,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getQuiz, getQuizResult } from "@/lib/quizzes";
import { getClass, listMembers } from "@/lib/classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import DateTime from "@/components/DateTime";
import QuizRunner from "@/components/student/QuizRunner";

export const metadata: Metadata = { title: "Detail Kuis" };

const OPTION_LABELS = ["A", "B", "C", "D"];

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("student");

  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  const cls = await getClass(quiz.classId);
  const members = await listMembers(quiz.classId);
  if (!members.some((member) => member.uid === me.uid)) {
    redirect("/murid/kelas");
  }

  const result = await getQuizResult(quiz.id, me.uid);
  const overdue = quiz.dueAt != null && Date.now() > quiz.dueAt;
  const percent = result && result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <div className="space-y-5">
      <Link
        href={`/murid/kelas/${quiz.classId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kelas{cls ? `: ${cls.name}` : ""}
      </Link>

      {/* Info kuis */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-brand-600" />
                {quiz.title}
              </CardTitle>
              {cls && <p className="mt-1 text-xs text-slate-500">Kelas: {cls.name}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="slate">Kuis</Badge>
              {result ? (
                <Badge tone="green">Selesai</Badge>
              ) : overdue ? (
                <Badge tone="red">Lewat Tenggat</Badge>
              ) : (
                <Badge tone="amber">Belum Dikerjakan</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {quiz.questions.length} soal pilihan ganda
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {quiz.dueAt ? (
                <>
                  Tenggat: <DateTime value={quiz.dueAt} />
                </>
              ) : (
                "Tanpa tenggat"
              )}
            </span>
          </div>

          {overdue && !result && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Batas waktu pengerjaan telah lewat; kuis tidak dapat dikumpulkan lagi.
            </p>
          )}

          {quiz.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {quiz.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hasil + kunci jawaban, atau form pengerjaan */}
      {result ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">Skor Anda</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {result.score}
                    <span className="text-sm font-medium text-slate-500"> / {result.total}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge tone="brand">{percent}% benar</Badge>
                <p className="mt-1.5 text-xs text-slate-500">
                  Dikerjakan: <DateTime value={result.submittedAt} />
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-brand-600" />
                Kunci Jawaban & Pembahasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {quiz.questions.map((question, qIndex) => {
                const chosen = result.answers[qIndex] ?? null;
                const correct = question.correctIndex;
                return (
                  <div key={question.id} className="space-y-2.5">
                    <p className="text-sm font-semibold text-slate-800">
                      {qIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-1.5">
                      {question.options.map((option, oIndex) => {
                        const isCorrect = oIndex === correct;
                        const isChosen = oIndex === chosen;
                        let toneClass = "border-slate-200 bg-white text-slate-600";
                        if (isCorrect) toneClass = "border-emerald-300 bg-emerald-50 text-emerald-900";
                        else if (isChosen) toneClass = "border-red-300 bg-red-50 text-red-800";
                        return (
                          <div
                            key={oIndex}
                            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${toneClass}`}
                          >
                            <span className="font-semibold text-slate-500">
                              {OPTION_LABELS[oIndex] ?? oIndex + 1}.
                            </span>
                            <span className="min-w-0 flex-1">{option}</span>
                            {isCorrect && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                            {!isCorrect && isChosen && <X className="h-4 w-4 shrink-0 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500">
                      Kunci jawaban:{" "}
                      <span className="font-semibold text-emerald-700">
                        {OPTION_LABELS[correct] ?? correct + 1}
                      </span>
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : (
        <QuizRunner quizId={quiz.id} questions={quiz.questions} dueAt={quiz.dueAt} />
      )}
    </div>
  );
}
