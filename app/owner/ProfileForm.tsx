"use client";

import { useState } from "react";
import { updateProfileAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface ProfileFormProps {
  defaultDisplayName?: string;
  defaultBio?: string;
}

export default function ProfileForm({ defaultDisplayName = "", defaultBio = "" }: ProfileFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const displayName = String(data.get("displayName") ?? "");
    const bio = String(data.get("bio") ?? "");

    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const result = await updateProfileAction(displayName, bio);
      if (result.ok) {
        setMessage("Profil berhasil diperbarui.");
      } else {
        setError(result.error ?? "Gagal memperbarui profil.");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Field
        label="Nama Tampilan (Display Name)"
        htmlFor="displayName"
        hint="Opsional. Jika kosong, nama Google yang digunakan."
      >
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultDisplayName}
          placeholder="Contoh: Bu Rina"
          maxLength={60}
        />
      </Field>

      <Field label="Bio" htmlFor="bio" hint="Ceritakan singkat tentang diri Anda (maks. 500 karakter).">
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={defaultBio}
          placeholder="Contoh: Guru matematika SMP, suka mengajar dengan pendekatan praktis."
          maxLength={500}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Profil"}
        </Button>
        {message && <p className="text-sm font-medium text-brand-700">{message}</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </form>
  );
}
