"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createAssignmentAction } from "@/app/guru/actions";
import type { Attachment } from "@/lib/types";
import { AttachmentUploader } from "./AttachmentUploader";
import { localInputToTs } from "./format";
import { inputClass, labelClass, primaryButton } from "./styles";

export function AssignmentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueLocal, setDueLocal] = useState("");
  const [weight, setWeight] = useState("1");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const weightNum = Number(weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("Bobot nilai harus berupa angka lebih dari 0.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await createAssignmentAction({
      classId,
      title,
      description,
      dueAt: localInputToTs(dueLocal),
      weight: Math.round(weightNum),
      attachments,
    });
    setBusy(false);
    if (result.ok) {
      router.push(`/guru/kelas/${classId}`);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan tugas.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="asg-title" className={labelClass}>Judul Tugas</label>
        <input id="asg-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. PR Bab 3" required />
      </div>
      <div>
        <label htmlFor="asg-desc" className={labelClass}>Deskripsi / Petunjuk Tugas</label>
        <textarea id="asg-desc" className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tulis petunjuk pengerjaan…" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="asg-due" className={labelClass}>Tenggat Waktu (opsional)</label>
          <input id="asg-due" type="datetime-local" className={inputClass} value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
        </div>
        <div>
          <label htmlFor="asg-weight" className={labelClass}>Bobot Nilai</label>
          <input id="asg-weight" type="number" min={1} className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </div>
      </div>
      <div>
        <span className={labelClass}>Lampiran</span>
        <AttachmentUploader value={attachments} onChange={setAttachments} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Tugas
        </button>
        <button type="button" onClick={() => router.push(`/guru/kelas/${classId}`)} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Batal
        </button>
      </div>
    </form>
  );
}
