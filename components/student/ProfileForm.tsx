"use client";

import { useActionState } from "react";
import { UserRound, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfileAction, type ProfileState } from "@/app/murid/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";

interface ProfileFormProps {
  initialDisplayName: string;
  initialBio: string;
}

const initialState: ProfileState = { ok: false };

export default function ProfileForm({ initialDisplayName, initialBio }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-brand-600" />
          Edit Profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Field
            label="Display Name (nama tampilan)"
            htmlFor="displayName"
            hint="Nama ini tampil di daftar guru/siswa dan pesan chat. Kosongkan untuk memakai nama Google."
          >
            <Input
              id="displayName"
              name="displayName"
              defaultValue={initialDisplayName}
              placeholder="Contoh: Budi Santoso"
              maxLength={60}
            />
          </Field>

          <Field label="Bio singkat" htmlFor="bio" hint="Ceritakan singkat tentang diri Anda (maks. 200 karakter).">
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initialBio}
              rows={4}
              maxLength={200}
              placeholder="Tulis bio singkat..."
            />
          </Field>

          {state.ok && state.message && (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {state.message}
            </p>
          )}
          {!state.ok && state.error && (
            <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
