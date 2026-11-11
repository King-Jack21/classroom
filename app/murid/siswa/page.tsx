import { Users } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listUsers } from "@/lib/users";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import PersonCard from "@/components/student/PersonCard";

export const metadata = { title: "Siswa" };

export default async function MuridSiswaPage() {
  await requireRole("student");
  const users = await listUsers();
  const students = users.filter((u) => u.role === "student");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Users className="h-5 w-5 text-brand-600" />
          Daftar Siswa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Seluruh siswa (murid) yang terdaftar di platform ini.
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Belum ada siswa"
            description="Daftar siswa akan muncul di sini setelah ada akun murid lain."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {students.map((user) => (
            <PersonCard key={user.uid} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
