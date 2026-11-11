import Link from "next/link";
import {
  LibraryBig,
  ClipboardList,
  HelpCircle,
  ArrowRight,
  Clock,
  MessagesSquare,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { listJoinedClasses } from "@/lib/classes";
import { listFeed } from "@/lib/feed";
import { listAssignmentsByClass, getSubmission } from "@/lib/assignments";
import { listQuizzesByClass, getQuizResult } from "@/lib/quizzes";
import { getDisplayName, roleLabel } from "@/lib/users";
import type { Assignment, Quiz, FeedItem, Classroom } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import FeedItemCard from "@/components/student/FeedItemCard";

interface PendingAssignment {
  assignment: Assignment;
  className: string;
  overdue: boolean;
}

interface PendingQuiz {
  quiz: Quiz;
  className: string;
  overdue: boolean;
}

export default async function MuridHomePage() {
  const me = await requireRole("student");
  const classes = await listJoinedClasses(me.uid);

  // Feed gabungan dari seluruh kelas yang diikuti (terbaru dulu).
  const mergedFeed: (FeedItem & { className?: string })[] = [];
  for (const cls of classes) {
    const items = await listFeed(cls.id);
    for (const item of items) {
      mergedFeed.push({ ...item, className: cls.name });
    }
  }
  mergedFeed.sort((a, b) => b.createdAt - a.createdAt);
  const latestFeed = mergedFeed.slice(0, 10);

  // Ringkasan tugas & kuis yang belum dikerjakan.
  const pendingAssignments: PendingAssignment[] = [];
  const pendingQuizzes: PendingQuiz[] = [];
  for (const cls of classes) {
    const assignments = await listAssignmentsByClass(cls.id);
    for (const assignment of assignments) {
      const submission = await getSubmission(assignment.id, me.uid);
      if (!submission) {
        pendingAssignments.push({
          assignment,
          className: cls.name,
          overdue: assignment.dueAt != null && Date.now() > assignment.dueAt,
        });
      }
    }
    const quizzes = await listQuizzesByClass(cls.id);
    for (const quiz of quizzes) {
      const result = await getQuizResult(quiz.id, me.uid);
      if (!result) {
        pendingQuizzes.push({
          quiz,
          className: cls.name,
          overdue: quiz.dueAt != null && Date.now() > quiz.dueAt,
        });
      }
    }
  }

  const name = getDisplayName(me);

  return (
    <div className="space-y-6">
      {/* Sapaan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Halo, {name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Selamat belajar — berikut ringkasan aktivitas kelas Anda.
          </p>
        </div>
        <Badge tone="brand">{roleLabel(me.role)}</Badge>
      </div>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Kelas Diikuti"
          value={classes.length}
          icon={LibraryBig}
        />
        <StatCard
          label="Tugas Belum Dikumpulkan"
          value={pendingAssignments.length}
          icon={ClipboardList}
        />
        <StatCard
          label="Kuis Belum Dikerjakan"
          value={pendingQuizzes.length}
          icon={HelpCircle}
        />
      </div>

      {/* Kelas yang diikuti */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Kelas yang Diikuti</h2>
          <Link
            href="/murid/kelas"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Lihat semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {classes.length === 0 ? (
          <Card>
            <EmptyState
              icon={LibraryBig}
              title="Belum ada kelas"
              description="Gabung ke kelas dengan kode invite dari guru Anda untuk mulai belajar."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {classes.map((cls: Classroom) => (
              <Link key={cls.id} href={`/murid/kelas/${cls.id}`} className="block">
                <Card className="h-full transition-colors hover:border-brand-300">
                  <CardContent className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                    <p className="text-xs font-medium text-brand-700">{cls.subject}</p>
                    {cls.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {cls.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Tugas & kuis menunggu */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand-600" />
              Tugas Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pendingAssignments.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                Semua tugas sudah dikumpulkan. 🎉
              </p>
            ) : (
              pendingAssignments.map(({ assignment, className, overdue }) => (
                <Link
                  key={assignment.id}
                  href={`/murid/tugas/${assignment.id}`}
                  className="block rounded-xl border border-slate-200 px-3.5 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {assignment.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{className}</p>
                    </div>
                    {overdue ? (
                      <Badge tone="red">Terlambat</Badge>
                    ) : (
                      <Badge tone="amber">Belum</Badge>
                    )}
                  </div>
                  {assignment.dueAt && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Tenggat: {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(assignment.dueAt))}
                    </p>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-brand-600" />
              Kuis Menunggu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pendingQuizzes.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                Semua kuis sudah dikerjakan. 🎉
              </p>
            ) : (
              pendingQuizzes.map(({ quiz, className, overdue }) => (
                <Link
                  key={quiz.id}
                  href={`/murid/kuis/${quiz.id}`}
                  className="block rounded-xl border border-slate-200 px-3.5 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{quiz.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {className} · {quiz.questions.length} soal
                      </p>
                    </div>
                    {overdue ? (
                      <Badge tone="red">Terlambat</Badge>
                    ) : (
                      <Badge tone="amber">Belum</Badge>
                    )}
                  </div>
                  {quiz.dueAt && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Tenggat: {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(quiz.dueAt))}
                    </p>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* Feed terbaru gabungan */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4 text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">Feed Terbaru</h2>
        </div>
        {latestFeed.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessagesSquare}
              title="Belum ada materi"
              description="Materi, tugas, dan kuis dari kelas yang Anda ikuti akan muncul di sini."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {latestFeed.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                showClass={item.className}
                href={
                  item.kind === "assignment"
                    ? `/murid/tugas/${item.id}`
                    : item.kind === "quiz"
                      ? `/murid/kuis/${item.id}`
                      : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
