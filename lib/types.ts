export type Role = "owner" | "teacher" | "student";

export interface Attachment {
  url: string;
  name: string;
  size: number;
  mime: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  displayName?: string;
  bio?: string;
  createdAt: number;
  disabled?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  description: string;
  ownerId: string;
  inviteCode: string;
  createdAt: number;
}

export interface Material {
  id: string;
  kind: "material";
  classId: string;
  authorId: string;
  title: string;
  body: string;
  attachments: Attachment[];
  createdAt: number;
}

export interface Assignment {
  id: string;
  kind: "assignment";
  classId: string;
  authorId: string;
  title: string;
  description: string;
  dueAt: number | null;
  weight: number;
  attachments: Attachment[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  kind: "quiz";
  classId: string;
  authorId: string;
  title: string;
  description: string;
  dueAt: number | null;
  timeLimitMin: number | null;
  questions: QuizQuestion[];
  createdAt: number;
}

export type FeedItem = Material | Assignment | Quiz;

export interface Submission {
  assignmentId: string;
  uid: string;
  text: string;
  attachments: Attachment[];
  submittedAt: number;
  late: boolean;
  grade: number | null;
  feedback: string | null;
  gradedAt: number | null;
  graderId: string | null;
}

export interface QuizResult {
  quizId: string;
  uid: string;
  answers: (number | null)[];
  score: number;
  total: number;
  submittedAt: number;
}

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  role: Role;
  image?: string | null;
  text: string;
  createdAt: number;
}

export interface ActivityEntry {
  id: string;
  uid: string;
  name: string;
  action: string;
  detail?: string;
  createdAt: number;
}
