"use client";

import { useRef, useState } from "react";
import { Paperclip, Upload, X, Loader2 } from "lucide-react";
import type { Attachment } from "@/lib/types";
import { formatBytes } from "./format";

export function AttachmentUploader({
  value,
  onChange,
}: {
  value: Attachment[];
  onChange: (files: Attachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && data.attachment) {
        onChange([...value, data.attachment as Attachment]);
      } else {
        setError(data?.error ?? "Gagal mengunggah file. Coba lagi.");
      }
    } catch {
      setError("Gagal mengunggah file. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-teal-300 bg-teal-50/50 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? "Mengunggah…" : "Lampirkan file (foto / video / dokumen)"}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.zip,.ppt,.pptx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.url}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-teal-700 underline-offset-2 hover:underline"
              >
                {file.name}
              </a>
              <span className="shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Hapus lampiran"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
