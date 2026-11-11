"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/rbac";
import { joinClassByCode, listMembers } from "@/lib/classes";
import { getAssignment, upsertSubmission } from "@/lib/assignments";
import { getQuiz, getQuizResult, gradeQuiz, saveQuizResult } from "@/lib/quizzes";
import { updateProfile } from "@/lib/users";
import { logActivity } from "@/lib/activity";
import type { Attachment } from "@/lib/types";

export type ActionResult = { ok: boolean; error?: string };
export type JoinState = { ok: boolean; error?: string; message?: string };
export type ProfileState = { ok: boolean; error?: string; message?: string };

/** Cek keanggotaan kelas di sisi server (hanya anggota yang boleh mengakses). */
async function isClassMember(classId: string, uid: string): Promise<boolean> {
  const members = await listMembers(classId);
  return members.some((member) => member.uid === uid);
}

// ---------------- Gabung kelas via kode invite ----------------

export async function joinClassAction(prev: JoinState, formData: FormData): Promise<JoinState> {
  const me = await requireRole("student");
  const code = String(formData.get("code") ?? "");
  const result = await joinClassByCode(code, me.uid);

  if (!result.ok) {
    return { ok: false, error: result.reason ?? "Gagal bergabung ke kelas." };
  }

  const alreadyJoined = result.reason?.toLowerCase().includes("sudah");
  await logActivity(me.uid, "kelas_diikuti", result.classroom?.name);
  revalidatePath("/murid/kelas");
  revalidatePath("/murid");

  if (alreadyJoined) {
    return { ok: true, message: result.reason };
  }
  return {
    ok: true,
    message: `Berhasil bergabung dengan kelas "${result.classroom?.name ?? ""}".`,
  };
}

// ---------------- Pengumpulan tugas ----------------

export async function submitAssignmentAction(
  assignmentId: string,
  text: string,
  attachments: Attachment[],
): Promise<ActionResult & { late?: boolean }> {
  const me = await requireRole("student");
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return { ok: false, error: "Tugas tidak ditemukan." };

  const member = await isClassMember(assignment.classId, me.uid);
  if (!member) return { ok: false, error: "Anda bukan anggota kelas ini." };

  const submission = await upsertSubmission({
    assignmentId,
    uid: me.uid,
    text: text.trim(),
    attachments: attachments ?? [],
    dueAt: assignment.dueAt,
  });

  await logActivity(me.uid, "tugas_dikumpulkan", assignment.title);
  revalidatePath(`/murid/tugas/${assignmentId}`);
  revalidatePath(`/murid/kelas/${assignment.classId}`);
  revalidatePath("/murid/nilai");
  revalidatePath("/murid");
  return { ok: true, late: submission.late };
}

// ---------------- Submit kuis ----------------

export async function submitQuizAction(
  quizId: string,
  answers: (number | null)[],
): Promise<ActionResult & { score?: number; total?: number }> {
  const me = await requireRole("student");
  const quiz = await getQuiz(quizId);
  if (!quiz) return { ok: false, error: "Kuis tidak ditemukan." };

  const member = await isClassMember(quiz.classId, me.uid);
  if (!member) return { ok: false, error: "Anda bukan anggota kelas ini." };

  const existing = await getQuizResult(quizId, me.uid);
  if (existing) return { ok: false, error: "Anda sudah mengerjakan kuis ini." };

  if (quiz.dueAt != null && Date.now() > quiz.dueAt) {
    return { ok: false, error: "Batas waktu pengerjaan kuis telah lewat." };
  }

  const normalized: (number | null)[] = quiz.questions.map((_, index) =>
    answers[index] ?? null,
  );
  const { score, total } = gradeQuiz(quiz.questions, normalized);
  await saveQuizResult({
    quizId,
    uid: me.uid,
    answers: normalized,
    score,
    total,
  });

  await logActivity(me.uid, "kuis_dikumpulkan", quiz.title);
  revalidatePath(`/murid/kuis/${quizId}`);
  revalidatePath(`/murid/kelas/${quiz.classId}`);
  revalidatePath("/murid/nilai");
  revalidatePath("/murid");
  return { ok: true, score, total };
}

// ---------------- Profil (Display Name + Bio) ----------------

export async function updateProfileAction(prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireUser();
  const displayName = String(formData.get("displayName") ?? "");
  const bio = String(formData.get("bio") ?? "");

  const updated = await updateProfile(me.uid, { displayName, bio });
  if (!updated) return { ok: false, error: "Profil tidak ditemukan." };

  await logActivity(me.uid, "profil_diperbarui");
  revalidatePath("/murid/profil");
  return { ok: true, message: "Profil berhasil diperbarui." };
}
