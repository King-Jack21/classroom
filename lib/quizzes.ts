import { redis } from "@/lib/redis";
import type { Quiz, QuizQuestion, QuizResult, UserProfile } from "@/lib/types";
import { pushFeedItem, listFeed } from "@/lib/feed";
import { listMembers } from "@/lib/classes";

const QUIZ_KEY = (id: string) => `feed:${id}`;
const RESULT_KEY = (quizId: string, uid: string) => `quiz:results:${quizId}:${uid}`;

function genId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `quiz_${Date.now().toString(36)}${rand}`;
}

export async function createQuiz(input: {
  classId: string;
  authorId: string;
  title: string;
  description: string;
  dueAt: number | null;
  timeLimitMin: number | null;
  questions: QuizQuestion[];
}): Promise<Quiz> {
  const id = genId();
  const quiz: Quiz = {
    id,
    kind: "quiz",
    classId: input.classId,
    authorId: input.authorId,
    title: input.title.trim(),
    description: input.description.trim(),
    dueAt: input.dueAt,
    timeLimitMin: input.timeLimitMin,
    questions: input.questions,
    createdAt: Date.now(),
  };
  await redis.set(QUIZ_KEY(id), quiz);
  await pushFeedItem(input.classId, id);
  return quiz;
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  return redis.get<Quiz>(QUIZ_KEY(id));
}

export async function listQuizzesByClass(classId: string): Promise<Quiz[]> {
  const items = await listFeed(classId);
  return items.filter((item): item is Quiz => item.kind === "quiz");
}

export async function saveQuizResult(input: {
  quizId: string;
  uid: string;
  answers: (number | null)[];
  score: number;
  total: number;
}): Promise<QuizResult> {
  const result: QuizResult = {
    quizId: input.quizId,
    uid: input.uid,
    answers: input.answers,
    score: input.score,
    total: input.total,
    submittedAt: Date.now(),
  };
  await redis.set(RESULT_KEY(input.quizId, input.uid), result);
  return result;
}

export async function getQuizResult(
  quizId: string,
  uid: string,
): Promise<QuizResult | null> {
  return redis.get<QuizResult>(RESULT_KEY(quizId, uid));
}

export async function listQuizResults(
  quizId: string,
): Promise<(QuizResult & { user: UserProfile | null })[]> {
  const quiz = await getQuiz(quizId);
  if (!quiz) return [];
  const members = await listMembers(quiz.classId);
  const rows: (QuizResult & { user: UserProfile | null })[] = [];
  for (const user of members) {
    const result = await redis.get<QuizResult>(RESULT_KEY(quizId, user.uid));
    if (result) rows.push({ ...result, user });
  }
  return rows.sort((a, b) => b.submittedAt - a.submittedAt);
}

/** Koreksi otomatis: jumlah jawaban yang cocok dengan correctIndex. */
export function gradeQuiz(
  questions: QuizQuestion[],
  answers: (number | null)[],
): { score: number; total: number } {
  let score = 0;
  questions.forEach((question, index) => {
    if (answers[index] === question.correctIndex) score += 1;
  });
  return { score, total: questions.length };
}
