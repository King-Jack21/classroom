import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Plus, Users, KeyRound } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getClass, listMembers } from "@/lib/classes";
import { listFeed } from "@/lib/feed";
import { getDisplayName, roleLabel } from "@/lib/users";
import type { FeedItem } from "@/lib/types";
import { InviteCode } from "@/components/teacher/InviteCode";
import { ClassManageBar } from "@/components/teacher/ClassManageBar";
import { FeedItemCard } from "@/components/teacher/FeedItemCard";
import { EmptyState } from "@/components/teacher/EmptyState";
import { formatDate } from "@/components/teacher/format";

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function hrefFor(item: FeedItem): string | undefined {
  if (item.kind === "assignment") return `/guru/tugas/${item.id}`;
  if (item.kind === "quiz") return `/guru/kuis/${item.id}`;
  return undefined;
}

export default async function GuruClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireRole("teacher", "owner");
  const cls = await getClass(id);
  if (!cls) notFound();

  const isOwner = cls.ownerId === me.uid;
  // Selain pemilik (mis. owner platform) hanya boleh melihat, tidak mengelola.
  if (!isOwner && me.role !== "owner") redirect("/guru");

  const members = await listMembers(id);
  const feed = await listFeed(id);
  const materials = feed.filter((i) => i.kind === "material");
  const assignments = feed.filter((i) => i.kind === "assignment");
  const quizzes = feed.filter((i) => i.kind === "quiz");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-16 pt-6">
      <div>
        <Link href="/guru/kelas" className="text-sm font-medium text-teal-700 hover:underline">
          ← Kembali ke daftar kelas
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{cls.name}</h1>
        <p className="text-sm font-medium text-teal-700">{cls.subject}</p>
        {cls.description ? <p className="mt-2 text-sm text-slate-600">{cls.description}</p> : null}
        <p className="mt-1 text-xs text-slate-400">Dibuat {formatDate(cls.createdAt)}</p>
      </div>

      {isOwner ? (
        <section className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900">
              <KeyRound className="h-4 w-4 text-teal-600" /> Kode Undangan Kelas
            </h2>
            <p className="mb-2 text-xs text-slate-500">Bagikan kode ini kepada siswa untuk bergabung.</p>
            <InviteCode code={cls.inviteCode} />
          </div>
          <ClassManageBar
            classId={cls.id}
            initial={{ name: cls.name, subject: cls.subject, description: cls.description }}
          />
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
          <Users className="h-4 w-4 text-teal-600" /> Anggota Kelas ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada siswa yang bergabung.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.uid} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                  {initials(getDisplayName(member))}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{getDisplayName(member)}</p>
                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {roleLabel(member.role)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Materi</h2>
          {isOwner ? (
            <Link
              href={`/guru/kelas/${cls.id}/materi-baru`}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Materi
            </Link>
          ) : null}
        </div>
        {materials.length === 0 ? (
          <EmptyState title="Belum ada materi" />
        ) : (
          <div className="space-y-3">
            {materials.map((item) => (
              <FeedItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Tugas</h2>
          {isOwner ? (
            <Link
              href={`/guru/kelas/${cls.id}/tugas-baru`}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Tugas
            </Link>
          ) : null}
        </div>
        {assignments.length === 0 ? (
          <EmptyState title="Belum ada tugas" />
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <FeedItemCard key={item.id} item={item} href={hrefFor(item)} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Kuis</h2>
          {isOwner ? (
            <Link
              href={`/guru/kelas/${cls.id}/kuis-baru`}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Kuis
            </Link>
          ) : null}
        </div>
        {quizzes.length === 0 ? (
          <EmptyState title="Belum ada kuis" />
        ) : (
          <div className="space-y-3">
            {quizzes.map((item) => (
              <FeedItemCard key={item.id} item={item} href={hrefFor(item)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
      }
