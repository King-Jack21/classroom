"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { gradeSubmissionAction } from "@/app/guru/actions";
import { inputClass, primaryButton } from "./styles";

export function SubmissionGradeForm({
  assignmentId,
  uid,
}: {
  assignmentId: string;
  uid: string;
}) {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await gradeSubmissionAction(assignmentId, uid, Number(grade), feedback);
    setBusy(false);
    if (result.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan nilai.");
    }
  }

  if (saved) {
    return <p className="text-sm text-emerald-600">Nilai tersimpan. Halaman diperbarui.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`grade-${uid}`} className="block text-sm font-medium text-slate-700">Nilai (0–100)</label>
        <input
          id={`grade-${uid}`}
          type="number"
          min={0}
          max={100}
          className={inputClass + " max-w-[120px]"}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="85"
          required
        />
      </div>
      <textarea
        className={inputClass}
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Komentar untuk siswa (opsional)"
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      <button type="submit" disabled={busy} className={primaryButton + " px-3 py-2 text-xs"}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Beri Nilai
      </button>
    </form>
  );
}
