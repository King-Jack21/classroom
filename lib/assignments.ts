import { redis } from "@/lib/redis";
import type { Assignment, Attachment, Submission, UserProfile } from "@/lib/types";
import { pushFeedItem, listFeed } from "@/lib/feed";
import { listMembers } from "@/lib/classes";

const ASSIGNMENT_KEY = (id: string) => `feed:${id}`;
const SUBMISSION_KEY = (assignmentId: string, uid: string) =>
  `submissions:${assignmentId}:${uid}`;

function genId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `asg_${Date.now().toString(36)}${rand}`;
}

export async function createAssignment(input: {
  classId: string;
  authorId: string;
  title: string;
  description: string;
  dueAt: number | null;
  weight: number;
  attachments: Attachment[];
}): Promise<Assignment> {
  const id = genId();
  const assignment: Assignment = {
    id,
    kind: "assignment",
    classId: input.classId,
    authorId: input.authorId,
    title: input.title.trim(),
    description: input.description.trim(),
    dueAt: input.dueAt,
    weight: input.weight > 0 ? input.weight : 1,
    attachments: input.attachments ?? [],
    createdAt: Date.now(),
  };
  await redis.set(ASSIGNMENT_KEY(id), assignment);
  await pushFeedItem(input.classId, id);
  return assignment;
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  return redis.get<Assignment>(ASSIGNMENT_KEY(id));
}

export async function listAssignmentsByClass(classId: string): Promise<Assignment[]> {
  const items = await listFeed(classId);
  return items.filter((item): item is Assignment => item.kind === "assignment");
}

export async function getSubmission(
  assignmentId: string,
  uid: string,
): Promise<Submission | null> {
  return redis.get<Submission>(SUBMISSION_KEY(assignmentId, uid));
}

export async function upsertSubmission(input: {
  assignmentId: string;
  uid: string;
  text: string;
  attachments: Attachment[];
  dueAt: number | null;
}): Promise<Submission> {
  const key = SUBMISSION_KEY(input.assignmentId, input.uid);
  const existing = await redis.get<Submission>(key);
  const submittedAt = Date.now();
  const late = input.dueAt != null && submittedAt > input.dueAt;
  const submission: Submission = {
    assignmentId: input.assignmentId,
    uid: input.uid,
    text: input.text,
    attachments: input.attachments ?? [],
    submittedAt,
    late,
    // Pertahankan nilai & komentar bila sudah dinilai guru.
    grade: existing?.grade ?? null,
    feedback: existing?.feedback ?? null,
    gradedAt: existing?.gradedAt ?? null,
    graderId: existing?.graderId ?? null,
  };
  await redis.set(key, submission);
  return submission;
}

export async function listSubmissions(
  assignmentId: string,
): Promise<(Submission & { user: UserProfile | null })[]> {
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return [];
  const members = await listMembers(assignment.classId);
  const rows: (Submission & { user: UserProfile | null })[] = [];
  for (const user of members) {
    const submission = await redis.get<Submission>(SUBMISSION_KEY(assignmentId, user.uid));
    if (submission) rows.push({ ...submission, user });
  }
  return rows.sort((a, b) => a.submittedAt - b.submittedAt);
}

export async function gradeSubmission(
  assignmentId: string,
  uid: string,
  grade: number,
  feedback: string,
  graderId: string,
): Promise<void> {
  const key = SUBMISSION_KEY(assignmentId, uid);
  const existing = await redis.get<Submission>(key);
  if (!existing) return;
  const updated: Submission = {
    ...existing,
    grade,
    feedback: feedback.trim(),
    gradedAt: Date.now(),
    graderId,
  };
  await redis.set(key, updated);
}
