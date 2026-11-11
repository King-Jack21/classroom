"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, X } from "lucide-react";
import { updateClassAction, deleteClassAction } from "@/app/guru/actions";
import { inputClass, labelClass, primaryButton, outlineButton, dangerButton } from "./styles";

export function ClassManageBar({
  classId,
  initial,
}: {
  classId: string;
  initial: { name: string; subject: string; description: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initial.name);
  const [subject, setSubject] = useState(initial.subject);
  const [description, setDescription] = useState(initial.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await updateClassAction(classId, { name, subject, description });
    setBusy(false);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal menyimpan perubahan.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Yakin menghapus kelas ini? Seluruh materi, tugas, kuis, dan anggota kelas akan dihapus permanen.",
    );
    if (!confirmed) return;
    setBusy(true);
    const result = await deleteClassAction(classId);
    if (result.ok) {
      router.push("/guru/kelas");
      router.refresh();
    } else {
      setBusy(false);
      setError(result.error ?? "Gagal menghapus kelas.");
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditing(true)} className={outlineButton}>
          <Pencil className="h-4 w-4" /> Edit Kelas
        </button>
        <button type="button" onClick={handleDelete} disabled={busy} className={dangerButton}>
          <Trash2 className="h-4 w-4" /> Hapus Kelas
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Edit Kelas</h3>
      <div>
        <label htmlFor="edit-name" className={labelClass}>Nama Kelas</label>
        <input id="edit-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="edit-subject" className={labelClass}>Mata Pelajaran</label>
        <input id="edit-subject" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="edit-desc" className={labelClass}>Deskripsi</label>
        <textarea id="edit-desc" className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Simpan Perubahan
        </button>
        <button type="button" onClick={() => setEditing(false)} className={outlineButton}>
          <X className="h-4 w-4" /> Batal
        </button>
      </div>
    </form>
  );
}
