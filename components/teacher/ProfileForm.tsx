"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { updateProfileAction } from "@/app/guru/actions";
import { inputClass, labelClass, primaryButton } from "./styles";

export function ProfileForm({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string;
  initialBio: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const result = await updateProfileAction(displayName, bio);
    setBusy(false);
    if (result.ok) {
      setSaved(true);
    } else {
      setError(result.error ?? "Gagal menyimpan profil.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Edit Profil</h2>
      <div>
        <label htmlFor="profile-display" className={labelClass}>Nama Tampilan (Display Name)</label>
        <input
          id="profile-display"
          className={inputClass}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nama yang tampil di seluruh aplikasi"
        />
        <p className="mt-1 text-xs text-slate-400">Kosongkan untuk memakai nama Google Anda.</p>
      </div>
      <div>
        <label htmlFor="profile-bio" className={labelClass}>Bio</label>
        <textarea
          id="profile-bio"
          className={inputClass}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Ceritakan singkat tentang Anda…"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-600">Profil berhasil disimpan.</p> : null}
      <button type="submit" disabled={busy} className={primaryButton}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Simpan Profil
      </button>
    </form>
  );
}
