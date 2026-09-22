export interface AdminModule {
  _id: string;
  course: string;
  name: string;
  description?: string;
  estimatedDuration?: string;
  order: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleFormInput {
  name: string;
  description?: string;
  estimatedDuration?: string;
}

export interface AdminTopic {
  _id: string;
  course: string;
  module: string;
  name: string;
  description?: string;
  order: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicFormInput {
  name: string;
  description?: string;
}

export type LessonDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface CodeExample {
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface CommonMistake {
  wrong: string;
  right: string;
  explanation?: string;
}

export interface Practice {
  instructions: string;
  starterCode?: string;
  hint?: string;
}

export interface QuizQuestionAuthoring {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CodingTestCase {
  args: unknown[];
  expectedOutput: unknown;
}

export interface CodingQuestionAuthoring {
  prompt: string;
  starterCode: string;
  functionName: string;
  testCases: CodingTestCase[];
}

export interface StudentCodingQuestion {
  prompt: string;
  starterCode: string;
  functionName: string;
}

export interface AdminLesson {
  _id: string;
  topic: string;
  module: string;
  course: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order: number;
  difficulty: LessonDifficulty;
  published: boolean;

  whatIsIt: string;
  whyItMatters: string;
  analogy: string;
  simpleExample: string;
  technicalExplanation?: string;
  codeExamples: CodeExample[];
  realWorldUsage?: string;
  commonMistakes: CommonMistake[];
  practice: Practice | null;
  quiz: QuizQuestionAuthoring[];
  codingQuestion: CodingQuestionAuthoring | null;
  rememberThis?: string;
  keyTakeaways: string[];

  createdAt: string;
  updatedAt: string;
}

export interface LessonFormInput {
  title: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: LessonDifficulty;
  published?: boolean;
  whatIsIt?: string;
  whyItMatters?: string;
  analogy?: string;
  simpleExample?: string;
  technicalExplanation?: string;
  codeExamples?: CodeExample[];
  realWorldUsage?: string;
  commonMistakes?: CommonMistake[];
  practice?: Practice | null;
  quiz?: QuizQuestionAuthoring[];
  codingQuestion?: CodingQuestionAuthoring | null;
  rememberThis?: string;
  keyTakeaways?: string[];
}

/** Learner view — same shape minus quiz answers (stripped server-side until submission). */
export interface StudentQuizQuestion {
  question: string;
  options: string[];
}

export interface StudentLessonDetail {
  _id: string;
  topic: string;
  module: string;
  course: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty: LessonDifficulty;

  whatIsIt: string;
  whyItMatters: string;
  analogy: string;
  simpleExample: string;
  technicalExplanation?: string;
  codeExamples: CodeExample[];
  realWorldUsage?: string;
  commonMistakes: CommonMistake[];
  practice: Practice | null;
  quiz: StudentQuizQuestion[];
  codingQuestion: StudentCodingQuestion | null;
  rememberThis?: string;
  keyTakeaways: string[];

  completed: boolean;
  practiceCompleted: boolean;
  quizPassed: boolean;
  codingCompleted: boolean;
  quizBestScore?: number;
  quizAttempts: number;
  lockState: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  stage: {
    practiceRequired: boolean;
    practiceDone: boolean;
    quizRequired: boolean;
    quizDone: boolean;
    codingRequired: boolean;
    codingDone: boolean;
    nextStage: "PRACTICE" | "QUIZ" | "CODING" | null;
  };
}

export interface QuizSubmitResultItem {
  question: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation?: string;
}

export interface QuizSubmitResult {
  score: number;
  bestScore: number;
  passed: boolean;
  results: QuizSubmitResultItem[];
  lessonCompleted: boolean;
}

/** Server-side quiz session state — the client only ever sees the question at
 * `currentIndex`, never a previous one, and never the answer key until SUBMITTED. */
export interface QuizSessionState {
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "QUIT";
  totalQuestions: number;
  currentIndex?: number;
  done?: boolean;
  question?: StudentQuizQuestion | null;
  score?: number;
}

export interface CodingTestResult {
  passed: boolean;
  args: unknown[];
  expectedOutput: unknown;
  actualOutput?: unknown;
  error?: string;
}

export interface CodingSubmitResult {
  passed: boolean;
  testResults: CodingTestResult[];
  lessonCompleted: boolean;
}

export interface CodingLastSubmission {
  code: string;
  passed: boolean;
  testResults: CodingTestResult[];
  createdAt: string;
}
