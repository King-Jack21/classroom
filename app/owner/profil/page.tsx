import { requireRole } from "@/lib/rbac";
import { getDisplayName, roleLabel } from "@/lib/users";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import ProfileForm from "../ProfileForm";

export default async function OwnerProfilePage() {
  const user = await requireRole("owner");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola nama tampilan dan bio Anda.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar src={user.image ?? null} name={getDisplayName(user)} size={72} />
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <p className="text-lg font-semibold text-slate-900">{getDisplayName(user)}</p>
              <Badge tone="amber">{roleLabel(user.role)}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">Nama Google: {user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
          <CardDescription>
            Nama Google tidak dapat diubah di sini; gunakan nama tampilan bila ingin nama lain yang ditampilkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultDisplayName={user.displayName ?? ""}
            defaultBio={user.bio ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
