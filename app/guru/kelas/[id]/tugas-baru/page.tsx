import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getClass } from "@/lib/classes";
import { AssignmentForm } from "@/components/teacher/AssignmentForm";

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("teacher", "owner");
  const cls = await getClass(id);
  if (!cls) notFound();
  if (cls.ownerId !== me.uid) redirect(`/guru/kelas/${id}`);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-6">
      <Link href={`/guru/kelas/${id}`} className="text-sm font-medium text-teal-700 hover:underline">
        ← Kembali ke {cls.name}
      </Link>
      <div>
        <h1 className="text-xl font-bold text-slate-900">Buat Tugas</h1>
        <p className="text-sm text-slate-500">{cls.name} · {cls.subject}</p>
      </div>
      <AssignmentForm classId={id} />
    </div>
  );
}
