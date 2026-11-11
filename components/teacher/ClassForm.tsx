"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createClassAction } from "@/app/guru/actions";
import { inputClass, labelClass, primaryButton } from "./styles";

export function ClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await createClassAction({ name, subject, description });
    setBusy(false);
    if (result.ok && result.id) {
      router.push(`/guru/kelas/${result.id}`);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal membuat kelas.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Buat Kelas Baru</h2>
      <div>
        <label htmlFor="class-name" className={labelClass}>Nama Kelas</label>
        <input
          id="class-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Matematika Kel 9A"
          required
        />
      </div>
      <div>
        <label htmlFor="class-subject" className={labelClass}>Mata Pelajaran</label>
        <input
          id="class-subject"
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="mis. Matematika"
          required
        />
      </div>
      <div>
        <label htmlFor="class-desc" className={labelClass}>Deskripsi</label>
        <textarea
          id="class-desc"
          className={inputClass}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat kelas (opsional)"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Buat Kelas
      </button>
    </form>
  );
}
