"use client";

import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { inputClass, outlineButton } from "./styles";

function newQuestion(): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
  };
}

export function QuizEditor({
  value,
  onChange,
}: {
  value: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}) {
  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    onChange(value.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function updateOption(qid: string, optionIndex: number, text: string) {
    onChange(
      value.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o, i) => (i === optionIndex ? text : o)) }
          : q,
      ),
    );
  }

  function addQuestion() {
    onChange([...value, newQuestion()]);
  }

  function removeQuestion(id: string) {
    if (value.length <= 1) return;
    onChange(value.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-4">
      {value.map((question, qIndex) => (
        <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Soal {qIndex + 1}</p>
            <button
              type="button"
              onClick={() => removeQuestion(question.id)}
              disabled={value.length <= 1}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus
            </button>
          </div>
          <textarea
            className={inputClass}
            rows={2}
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            placeholder="Tulis pertanyaan…"
            required
          />
          <div className="mt-3 space-y-2">
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === oIndex}
                  onChange={() => updateQuestion(question.id, { correctIndex: oIndex })}
                  className="h-4 w-4 shrink-0 accent-teal-600"
                />
                <input
                  className={inputClass}
                  value={option}
                  onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                  placeholder={`Opsi ${String.fromCharCode(65 + oIndex)}`}
                  required
                />
                {question.correctIndex === oIndex ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : null}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Pilih tombol bulat pada opsi yang menjadi kunci jawaban.</p>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className={outlineButton}>
        <Plus className="h-4 w-4" /> Tambah Soal
      </button>
    </div>
  );
}
