import { StudentQuizQuestion } from "@/types/module";

export interface FinalAssessmentSessionState {
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "QUIT";
  totalQuestions: number;
  currentIndex?: number;
  done?: boolean;
  question?: StudentQuizQuestion | null;
  score?: number;
  passed?: boolean;
}

export interface FinalAssessmentResultItem {
  question: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation?: string;
}

export interface FinalAssessmentSubmitResult {
  score: number;
  passed: boolean;
  /** Empty unless `passed` — the answer key is withheld on failed attempts. */
  results: FinalAssessmentResultItem[];
  reviewAvailable: boolean;
}
