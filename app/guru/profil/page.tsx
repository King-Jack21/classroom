import { requireUser } from "@/lib/rbac";
import { getDisplayName, roleLabel } from "@/lib/users";
import { ProfileForm } from "@/components/teacher/ProfileForm";

export default async function GuruProfilPage() {
  const me = await requireUser();
  const displayName = getDisplayName(me);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-sm text-slate-500">Lihat data akun dan ubah nama tampilan serta bio Anda.</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {me.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={me.image}
            alt={me.name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-100"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-900">{displayName}</p>
          <p className="truncate text-sm text-slate-500">{me.email}</p>
          <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
            {roleLabel(me.role)}
          </span>
          <p className="mt-1 text-xs text-slate-400">Nama Google: {me.name} (tidak dapat diubah)</p>
        </div>
      </div>

      {me.bio ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">Bio</h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{me.bio}</p>
        </div>
      ) : null}

      <ProfileForm
        initialDisplayName={me.displayName ?? ""}
        initialBio={me.bio ?? ""}
      />
    </div>
  );
}
