export type Role = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export type QuestionType = 'single' | 'multiple' | 'boolean' | 'text';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuizStatus = 'draft' | 'published';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  options: Option[];
  correctAnswers: string[]; // option IDs for single/multiple/boolean, or array of acceptable answer strings for text match
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes (0 means no limit)
  passingScore: number; // percentage (e.g. 70)
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number; // 0 means unlimited
  status: QuizStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface Attempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  answers: Record<string, string | string[]>;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // seconds
  startedAt: string;
  submittedAt: string;
  flaggedQuestions?: string[];
}

export interface ActiveAttemptState {
  attemptId: string;
  quizId: string;
  questionOrder: string[]; // question IDs in ordered sequence
  optionOrders: Record<string, string[]>; // questionId -> array of option IDs
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestions: string[];
  startedAtMs: number;
  totalDurationSeconds: number;
  lastUpdatedMs: number;
}
