import { GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listUsers } from "@/lib/users";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import PersonCard from "@/components/student/PersonCard";

export const metadata = { title: "Guru" };

export default async function MuridGuruPage() {
  await requireRole("student");
  const users = await listUsers();
  // Semua guru; owner ditandai khusus pada kartu.
  const teachers = users.filter((u) => u.role === "teacher" || u.role === "owner");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          Daftar Guru
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Seluruh guru dan pengelola (owner) di platform ini.
        </p>
      </div>

      {teachers.length === 0 ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Belum ada guru"
            description="Daftar guru akan muncul di sini setelah ada akun guru."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {teachers.map((user) => (
            <PersonCard key={user.uid} user={user} showBio highlightOwner />
          ))}
        </div>
      )}
    </div>
  );
}
