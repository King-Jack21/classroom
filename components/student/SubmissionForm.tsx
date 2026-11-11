"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Upload, Trash2, AlertCircle, Clock } from "lucide-react";
import type { Attachment } from "@/lib/types";
import { submitAssignmentAction } from "@/app/murid/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { formatBytes, isOverdue } from "./format";

interface SubmissionFormProps {
  assignmentId: string;
  dueAt: number | null;
}

export default function SubmissionForm({ assignmentId, dueAt }: SubmissionFormProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lateNote, setLateNote] = useState(false);

  const overdue = isOverdue(dueAt);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: Attachment[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          attachment?: Attachment;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.attachment) {
          throw new Error(data.error ?? `Gagal mengunggah "${file.name}".`);
        }
        uploaded.push(data.attachment);
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah berkas.");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!text.trim() && attachments.length === 0) {
      setError("Isi jawaban atau lampirkan berkas terlebih dahulu.");
      return;
    }
    setPending(true);
    try {
      const result = await submitAssignmentAction(assignmentId, text, attachments);
      if (!result.ok) {
        setError(result.error ?? "Gagal mengumpulkan tugas.");
        return;
      }
      setLateNote(Boolean(result.late));
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
          <Upload className="h-4 w-4 text-brand-600" />
          Kumpulkan Tugas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overdue && (
          <p className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            Tenggat pengumpulan telah lewat; pengumpulan akan ditandai sebagai terlambat.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Jawaban" htmlFor="answer-text" hint="Tulis jawaban atau ringkasan pengumpulan Anda di sini.">
            <Textarea
              id="answer-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Tulis jawaban Anda..."
            />
          </Field>

          <Field label="Lampiran (foto / video / dokumen)">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
              <Paperclip className="h-4 w-4" />
              {uploading ? "Mengunggah..." : "Pilih berkas (boleh lebih dari satu)"}
              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                disabled={uploading}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </Field>

          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((a, index) => (
                <li
                  key={`${a.url}-${index}`}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <Paperclip className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {a.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{formatBytes(a.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    aria-label="Hapus lampiran"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {lateNote && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              Tugas terkumpul, namun ditandai terlambat karena melewati tenggat.
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending || uploading}>
            {pending ? "Mengumpulkan..." : "Kumpulkan Tugas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
