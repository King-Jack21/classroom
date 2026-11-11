"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createQuizAction } from "@/app/guru/actions";
import type { QuizQuestion } from "@/lib/types";
import { QuizEditor } from "./QuizEditor";
import { localInputToTs } from "./format";
import { inputClass, labelClass, primaryButton } from "./styles";

function emptyQuestion(): QuizQuestion {
  return { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correctIndex: 0 };
}

export function QuizForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (questions.length < 1) {
      setError("Kuis minimal berisi 1 soal.");
      return;
    }
    for (const q of questions) {
      if (!q.question.trim()) {
        setError("Terdapat soal yang belum diisi teks pertanyaannya.");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError("Semua opsi pada setiap soal harus diisi.");
        return;
      }
    }
    const limitNum = timeLimit.trim() === "" ? null : Number(timeLimit);
    if (limitNum !== null && (!Number.isFinite(limitNum) || limitNum <= 0)) {
      setError("Batas waktu harus berupa menit positif (kosongkan jika tanpa batas).");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await createQuizAction({
      classId,
      title,
      description,
      dueAt: localInputToTs(dueLocal),
      timeLimitMin: limitNum,
      questions,
    });
    setBusy(false);
    if (result.ok) {
      router.push(`/guru/kelas/${classId}`);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan kuis.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quiz-title" className={labelClass}>Judul Kuis</label>
        <input id="quiz-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Kuis Bab 2" required />
      </div>
      <div>
        <label htmlFor="quiz-desc" className={labelClass}>Deskripsi (opsional)</label>
        <textarea id="quiz-desc" className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Petunjuk pengerjaan kuis…" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quiz-due" className={labelClass}>Tenggat Waktu (opsional)</label>
          <input id="quiz-due" type="datetime-local" className={inputClass} value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
        </div>
        <div>
          <label htmlFor="quiz-limit" className={labelClass}>Batas Waktu (menit, opsional)</label>
          <input id="quiz-limit" type="number" min={1} className={inputClass} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="mis. 30" />
        </div>
      </div>
      <div>
        <span className={labelClass}>Soal Pilihan Ganda</span>
        <QuizEditor value={questions} onChange={setQuestions} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Kuis
        </button>
        <button type="button" onClick={() => router.push(`/guru/kelas/${classId}`)} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Batal
        </button>
      </div>
    </form>
  );
}
