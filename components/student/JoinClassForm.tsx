"use client";

import { useActionState } from "react";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { joinClassAction, type JoinState } from "@/app/murid/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";

const initialState: JoinState = { ok: false };

export default function JoinClassForm() {
  const [state, formAction, pending] = useActionState(joinClassAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand-600" />
          Gabung Kelas dengan Kode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <Field label="Kode invite (6 karakter)" htmlFor="code" hint="Minta kode 6 karakter kepada guru Anda.">
            <Input
              id="code"
              name="code"
              placeholder="Contoh: A1B2C3"
              maxLength={6}
              autoComplete="off"
              className="uppercase tracking-widest"
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Memproses..." : "Gabung Kelas"}
          </Button>
        </form>

        {state.ok && state.message && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </p>
        )}
        {!state.ok && state.error && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
