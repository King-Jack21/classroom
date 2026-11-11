"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createMaterialAction } from "@/app/guru/actions";
import type { Attachment } from "@/lib/types";
import { AttachmentUploader } from "./AttachmentUploader";
import { inputClass, labelClass, primaryButton } from "./styles";

export function MaterialForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await createMaterialAction({ classId, title, body, attachments });
    setBusy(false);
    if (result.ok) {
      router.push(`/guru/kelas/${classId}`);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan materi.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mat-title" className={labelClass}>Judul Materi</label>
        <input id="mat-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Ringkasan Bab 1" required />
      </div>
      <div>
        <label htmlFor="mat-body" className={labelClass}>Isi / Deskripsi Materi</label>
        <textarea id="mat-body" className={inputClass} rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tulis isi materi…" />
      </div>
      <div>
        <span className={labelClass}>Lampiran</span>
        <AttachmentUploader value={attachments} onChange={setAttachments} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Materi
        </button>
        <button type="button" onClick={() => router.push(`/guru/kelas/${classId}`)} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Batal
        </button>
      </div>
    </form>
  );
}
