export type TaskType = "ASSIGNMENT" | "QUIZ" | "PROJECT";
export type TaskStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "LATE" | "EVALUATED";

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  marks: number;
}

export interface TrainerTask {
  _id: string;
  type: TaskType;
  title: string;
  description: string;
  batch: string;
  module?: string;
  dueDate: string;
  maxMarks: number;
  status: TaskStatus;
  attachmentUrls: string[];
  questions: QuizQuestion[];
  timeLimitMinutes?: number;
  attemptsAllowed?: number;
  requirements: string[];
  submissionFormat?: string;
  submissionCount: number;
  createdAt: string;
}

export type TaskFormInput =
  | {
      type: "ASSIGNMENT";
      title: string;
      description: string;
      batch: string;
      dueDate: string;
      maxMarks: number;
      attachmentUrls?: string[];
    }
  | {
      type: "QUIZ";
      title: string;
      description: string;
      batch: string;
      dueDate: string;
      maxMarks: number;
      questions: QuizQuestion[];
      timeLimitMinutes?: number;
      attemptsAllowed?: number;
    }
  | {
      type: "PROJECT";
      title: string;
      description: string;
      batch: string;
      dueDate: string;
      maxMarks: number;
      requirements?: string[];
      submissionFormat?: string;
    };

export interface TaskListQuery {
  batch?: string;
  status?: TaskStatus;
  type?: TaskType;
}

export interface SubmissionRow {
  _id: string;
  task: string;
  student: { _id: string; name: string; email: string };
  content?: string;
  fileUrl?: string;
  comments?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  marks?: number;
  feedback?: string;
}

export interface StudentTask extends Omit<TrainerTask, "submissionCount"> {
  mySubmission: { task: string; status: SubmissionStatus; marks?: number } | null;
}

export interface SubmitTaskInput {
  content?: string;
  fileUrl?: string;
  comments?: string;
}

export interface PendingSubmissionRow {
  _id: string;
  task: { _id: string; title: string; type: TaskType; maxMarks: number; dueDate: string };
  student: { _id: string; name: string; email: string };
  batch: { _id: string; name: string };
  fileUrl?: string;
  comments?: string;
  status: SubmissionStatus;
  submittedAt?: string;
}
