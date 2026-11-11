import {
  Users,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Layers,
  Activity,
  School,
  Inbox,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { redis } from "@/lib/redis";
import { listUsers, countByRole, getDisplayName, roleLabel } from "@/lib/users";
import { listActivity } from "@/lib/activity";
import type { ActivityEntry, Classroom, FeedItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import DateTime from "@/components/DateTime";
import { changeRole } from "./actions";

const ACTION_LABEL: Record<string, string> = {
  login: "Masuk aplikasi",
  kelas_dibuat: "Membuat kelas",
  materi_dibuat: "Membuat materi",
  tugas_dibuat: "Membuat tugas",
  kuis_dibuat: "Membuat kuis",
  tugas_dikumpulkan: "Mengumpulkan tugas",
  nilai_diberikan: "Memberi nilai",
  role_diubah: "Mengubah peran pengguna",
  kelas_diubah: "Mengubah kelas",
  kelas_dihapus: "Menghapus kelas",
  pesan_lobby: "Mengirim pesan lobby",
};

const ROLE_TONE: Record<string, BadgeTone> = {
  owner: "amber",
  teacher: "brand",
  student: "slate",
};

export default async function OwnerDashboardPage() {
  await requireRole("owner");

  const [roleCounts, users, activity, classIds, feedKeys] = await Promise.all([
    countByRole(),
    listUsers(),
    listActivity(10),
    redis.smembers<string[]>("classes:index"),
    redis.keys("feed:*"),
  ]);

  const feeds = await Promise.all(feedKeys.map((key) => redis.get<FeedItem>(key)));
  const assignmentCount = feeds.filter((f) => f?.kind === "assignment").length;
  const quizCount = feeds.filter((f) => f?.kind === "quiz").length;

  const classes = (
    await Promise.all(classIds.map((id) => redis.get<Classroom>(`classes:${id}`)))
  ).filter((c): c is Classroom => Boolean(c));
  classes.sort((a, b) => b.createdAt - a.createdAt);

  const sortedUsers = [...users].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard Owner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan seluruh pengguna, kelas, tugas, dan kuis di platform.
        </p>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Pengguna" value={users.length} icon={Users} />
        <StatCard label="Owner" value={roleCounts.owner} icon={ShieldCheck} />
        <StatCard label="Guru" value={roleCounts.teacher} icon={GraduationCap} />
        <StatCard label="Murid" value={roleCounts.student} icon={BookOpen} />
        <StatCard label="Kelas" value={classes.length} icon={School} />
        <StatCard label="Tugas" value={assignmentCount} icon={ClipboardList} />
        <StatCard label="Kuis" value={quizCount} icon={HelpCircle} />
        <StatCard label="Materi" value={feeds.filter((f) => f?.kind === "material").length} icon={Layers} />
      </div>

      {/* Daftar pengguna */}
      <Card>
        <CardHeader>
          <CardTitle>Pengguna Terdaftar</CardTitle>
          <CardDescription>Kelola peran murid dan guru. Peran Owner tidak dapat diubah.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sortedUsers.length === 0 ? (
            <EmptyState icon={Users} title="Belum ada pengguna" description="Pengguna akan muncul setelah pertama kali masuk dengan Google." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3 font-medium">Pengguna</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Peran</th>
                    <th className="px-4 py-3 font-medium">Bergabung</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((u) => (
                    <tr key={u.uid} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.image ?? null} name={getDisplayName(u)} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">{getDisplayName(u)}</p>
                            {u.displayName?.trim() && u.displayName.trim() !== u.name && (
                              <p className="truncate text-xs text-slate-400">{u.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={ROLE_TONE[u.role] ?? "slate"}>{roleLabel(u.role)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <DateTime value={u.createdAt} />
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "owner" ? (
                          <span className="text-xs text-slate-400">Tidak dapat diubah</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {u.role !== "teacher" && (
                              <form action={changeRole.bind(null, u.uid, "teacher")}>
                                <Button type="submit" variant="outline" size="sm">
                                  Jadikan Guru
                                </Button>
                              </form>
                            )}
                            {u.role !== "student" && (
                              <form action={changeRole.bind(null, u.uid, "student")}>
                                <Button type="submit" variant="outline" size="sm">
                                  Jadikan Murid
                                </Button>
                              </form>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aktivitas terbaru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-600" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState icon={Activity} title="Belum ada aktivitas" description="Catatan aktivitas pengguna akan tampil di sini." />
            ) : (
              <ul className="space-y-3">
                {activity.map((entry: ActivityEntry) => (
                  <li key={entry.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{entry.name}</span>{" "}
                        {ACTION_LABEL[entry.action] ?? entry.action}
                      </p>
                      {entry.detail && <p className="text-xs text-slate-400">{entry.detail}</p>}
                      <DateTime value={entry.createdAt} className="text-xs text-slate-400" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Ringkasan kelas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-4 w-4 text-brand-600" />
              Daftar Kelas
            </CardTitle>
            <CardDescription>Ringkasan singkat seluruh kelas yang dibuat.</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <EmptyState icon={Inbox} title="Belum ada kelas" description="Kelas yang dibuat guru akan tampil di sini." />
            ) : (
              <ul className="space-y-3">
                {classes.map((cls) => (
                  <li key={cls.id} className="rounded-xl border border-slate-100 p-3">
                    <p className="font-medium text-slate-800">{cls.name}</p>
                    <p className="text-xs text-slate-500">{cls.subject || "Tanpa mata pelajaran"}</p>
                    <p className="mt-1 text-xs text-slate-400">Kode undangan: {cls.inviteCode}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
