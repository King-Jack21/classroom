"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/rbac";
import { createClass, updateClass, deleteClass, getClass } from "@/lib/classes";
import { createMaterial } from "@/lib/materials";
import { createAssignment, getAssignment, gradeSubmission } from "@/lib/assignments";
import { createQuiz } from "@/lib/quizzes";
import { sendLobbyMessage } from "@/lib/chat";
import { updateProfile } from "@/lib/users";
import { logActivity } from "@/lib/activity";
import type { Attachment, QuizQuestion } from "@/lib/types";

type ActionResult = { ok: boolean; error?: string; id?: string };

async function ownedClass(classId: string, uid: string) {
  const cls = await getClass(classId);
  if (!cls) return { error: "Kelas tidak ditemukan." as const };
  if (cls.ownerId !== uid) return { error: "Anda bukan pemilik kelas ini." as const };
  return { cls };
}

// ---------------- Kelas ----------------

export async function createClassAction(input: {
  name: string;
  subject: string;
  description: string;
}): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  if (!input.name.trim()) return { ok: false, error: "Nama kelas wajib diisi." };
  if (!input.subject.trim()) return { ok: false, error: "Mata pelajaran wajib diisi." };
  const cls = await createClass({
    name: input.name,
    subject: input.subject,
    description: input.description,
    ownerId: me.uid,
  });
  await logActivity(me.uid, "kelas_dibuat", cls.name);
  revalidatePath("/guru/kelas");
  revalidatePath("/guru");
  return { ok: true, id: cls.id };
}

export async function updateClassAction(
  classId: string,
  input: { name: string; subject: string; description: string },
): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const owned = await ownedClass(classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  if (!input.name.trim()) return { ok: false, error: "Nama kelas wajib diisi." };
  if (!input.subject.trim()) return { ok: false, error: "Mata pelajaran wajib diisi." };
  const updated = await updateClass(classId, {
    name: input.name,
    subject: input.subject,
    description: input.description,
  });
  if (!updated) return { ok: false, error: "Kelas tidak ditemukan." };
  await logActivity(me.uid, "kelas_diubah", updated.name);
  revalidatePath(`/guru/kelas/${classId}`);
  revalidatePath("/guru/kelas");
  return { ok: true, id: updated.id };
}

export async function deleteClassAction(classId: string): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const owned = await ownedClass(classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  await deleteClass(classId);
  await logActivity(me.uid, "kelas_dihapus", owned.cls.name);
  revalidatePath("/guru/kelas");
  revalidatePath("/guru");
  return { ok: true };
}

// ---------------- Materi / Tugas / Kuis ----------------

export async function createMaterialAction(input: {
  classId: string;
  title: string;
  body: string;
  attachments: Attachment[];
}): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const owned = await ownedClass(input.classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  if (!input.title.trim()) return { ok: false, error: "Judul materi wajib diisi." };
  const material = await createMaterial({
    classId: input.classId,
    authorId: me.uid,
    title: input.title,
    body: input.body,
    attachments: input.attachments,
  });
  await logActivity(me.uid, "materi_dibuat", material.title);
  revalidatePath(`/guru/kelas/${input.classId}`);
  return { ok: true, id: material.id };
}

export async function createAssignmentAction(input: {
  classId: string;
  title: string;
  description: string;
  dueAt: number | null;
  weight: number;
  attachments: Attachment[];
}): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const owned = await ownedClass(input.classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  if (!input.title.trim()) return { ok: false, error: "Judul tugas wajib diisi." };
  const assignment = await createAssignment({
    classId: input.classId,
    authorId: me.uid,
    title: input.title,
    description: input.description,
    dueAt: input.dueAt,
    weight: input.weight,
    attachments: input.attachments,
  });
  await logActivity(me.uid, "tugas_dibuat", assignment.title);
  revalidatePath(`/guru/kelas/${input.classId}`);
  return { ok: true, id: assignment.id };
}

export async function createQuizAction(input: {
  classId: string;
  title: string;
  description: string;
  dueAt: number | null;
  timeLimitMin: number | null;
  questions: QuizQuestion[];
}): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const owned = await ownedClass(input.classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  if (!input.title.trim()) return { ok: false, error: "Judul kuis wajib diisi." };
  if (!input.questions || input.questions.length < 1) {
    return { ok: false, error: "Kuis minimal berisi 1 soal." };
  }
  for (const q of input.questions) {
    if (!q.question.trim()) return { ok: false, error: "Teks soal tidak boleh kosong." };
    if (!q.options || q.options.length !== 4) {
      return { ok: false, error: "Setiap soal harus memiliki 4 opsi." };
    }
    if (q.options.some((o) => !o.trim())) {
      return { ok: false, error: "Semua opsi jawaban harus diisi." };
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
      return { ok: false, error: "Kunci jawaban belum ditentukan pada salah satu soal." };
    }
  }
  const quiz = await createQuiz({
    classId: input.classId,
    authorId: me.uid,
    title: input.title,
    description: input.description,
    dueAt: input.dueAt,
    timeLimitMin: input.timeLimitMin,
    questions: input.questions,
  });
  await logActivity(me.uid, "kuis_dibuat", quiz.title);
  revalidatePath(`/guru/kelas/${input.classId}`);
  return { ok: true, id: quiz.id };
}

// ---------------- Penilaian tugas ----------------

export async function gradeSubmissionAction(
  assignmentId: string,
  uid: string,
  grade: number,
  feedback: string,
): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return { ok: false, error: "Tugas tidak ditemukan." };
  const owned = await ownedClass(assignment.classId, me.uid);
  if ("error" in owned) return { ok: false, error: owned.error };
  const numericGrade = Number(grade);
  if (!Number.isFinite(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return { ok: false, error: "Nilai harus berupa angka 0–100." };
  }
  await gradeSubmission(
    assignmentId,
    uid,
    Math.round(numericGrade),
    feedback ?? "",
    me.uid,
  );
  await logActivity(me.uid, "nilai_diberikan", `Tugas ${assignment.title}`);
  revalidatePath(`/guru/tugas/${assignmentId}`);
  return { ok: true };
}

// ---------------- Lobby guru ----------------

export async function sendLobbyAction(text: string): Promise<ActionResult> {
  const me = await requireRole("teacher", "owner");
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Pesan tidak boleh kosong." };
  const message = await sendLobbyMessage(me.uid, trimmed);
  if (!message) return { ok: false, error: "Pesan gagal dikirim." };
  await logActivity(me.uid, "pesan_lobby", trimmed.slice(0, 80));
  revalidatePath("/guru/lobby");
  return { ok: true };
}

// ---------------- Profil ----------------

export async function updateProfileAction(displayName: string, bio: string): Promise<ActionResult> {
  const me = await requireUser();
  const updated = await updateProfile(me.uid, {
    displayName: displayName.trim(),
    bio: bio.trim(),
  });
  if (!updated) return { ok: false, error: "Profil tidak ditemukan." };
  revalidatePath("/guru/profil");
  return { ok: true };
}
