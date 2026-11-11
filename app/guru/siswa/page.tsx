import { Users } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listClassesByOwner, listMembers } from "@/lib/classes";
import { getDisplayName, roleLabel } from "@/lib/users";
import type { Role } from "@/lib/types";
import { EmptyState } from "@/components/teacher/EmptyState";

type StudentRow = {
  uid: string;
  name: string;
  email: string;
  role: Role;
  classes: string[];
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function GuruSiswaPage() {
  const me = await requireRole("teacher", "owner");
  const classes = await listClassesByOwner(me.uid);

  const map = new Map<string, StudentRow>();
  for (const cls of classes) {
    const members = await listMembers(cls.id);
    for (const member of members) {
      const existing = map.get(member.uid);
      if (existing) {
        existing.classes.push(cls.name);
      } else {
        map.set(member.uid, {
          uid: member.uid,
          name: getDisplayName(member),
          email: member.email,
          role: member.role,
          classes: [cls.name],
        });
      }
    }
  }
  const rows = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Siswa Saya</h1>
        <p className="text-sm text-slate-500">Agregasi siswa dari seluruh kelas yang Anda ampu.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada siswa"
          description="Siswa yang bergabung ke kelas Anda akan tercantum di sini."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.uid} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                  {initials(row.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{row.name}</p>
                  <p className="truncate text-xs text-slate-500">{row.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {roleLabel(row.role)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {row.classes.map((className) => (
                  <span key={className} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-100">
                    <Users className="h-3 w-3" /> {className}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
      }
