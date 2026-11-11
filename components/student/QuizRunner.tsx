"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Send, AlertCircle, Clock } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { submitQuizAction } from "@/app/murid/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { isOverdue } from "./format";

interface QuizRunnerProps {
  quizId: string;
  questions: QuizQuestion[];
  dueAt: number | null;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuizRunner({ quizId, questions, dueAt }: QuizRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overdue = isOverdue(dueAt);
  const answeredCount = answers.filter((a) => a !== null).length;

  function choose(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (answeredCount < questions.length) {
      setError(`Masih ada ${questions.length - answeredCount} soal yang belum dijawab.`);
      return;
    }
    setPending(true);
    try {
      const result = await submitQuizAction(quizId, answers);
      if (!result.ok) {
        setError(result.error ?? "Gagal mengumpulkan kuis.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-600" />
          Pengerjaan Kuis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overdue && (
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            Batas waktu pengerjaan telah lewat. Anda tidak dapat mengumpulkan kuis ini lagi.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {questions.map((question, qIndex) => (
            <Field key={question.id} label={`Soal ${qIndex + 1}: ${question.question}`}>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const checked = answers[qIndex] === oIndex;
                  return (
                    <label
                      key={oIndex}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                        checked
                          ? "border-brand-500 bg-brand-50 text-brand-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={checked}
                        onChange={() => choose(qIndex, oIndex)}
                        className="mt-1 h-4 w-4 accent-brand-600"
                      />
                      <span className="flex min-w-0 flex-1 items-start gap-2">
                        <span className="font-semibold text-slate-500">
                          {OPTION_LABELS[oIndex] ?? oIndex + 1}.
                        </span>
                        <span className="whitespace-pre-wrap leading-relaxed">{option}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Field>
          ))}

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || overdue}
          >
            <Send className="h-4 w-4" />
            {pending ? "Mengumpulkan..." : `Selesai & Lihat Skor (${answeredCount}/${questions.length})`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
