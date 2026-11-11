import { Mail, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getDisplayName, roleLabel } from "@/lib/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import ProfileForm from "@/components/student/ProfileForm";

export const metadata = { title: "Profil" };

export default async function MuridProfilPage() {
  const me = await requireRole("student");
  const displayName = getDisplayName(me);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola nama tampilan dan bio Anda. Nama Google tidak dapat diubah.
        </p>
      </div>

      {/* Ringkasan profil */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={me.image ?? null} name={displayName} size={72} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-slate-900">{displayName}</p>
                <Badge tone="brand">
                  <ShieldCheck className="h-3 w-3" />
                  {roleLabel(me.role)}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {me.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-50 px-3.5 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nama Google (read-only)
              </p>
              <p className="mt-0.5 text-sm text-slate-700">{me.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Bio
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                {me.bio?.trim() ? me.bio : "Belum ada bio."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form edit Display Name + Bio */}
      <ProfileForm
        initialDisplayName={me.displayName ?? ""}
        initialBio={me.bio ?? ""}
      />
    </div>
  );
}
