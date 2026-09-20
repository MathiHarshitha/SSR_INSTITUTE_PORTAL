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
  rememberThis?: string;
  keyTakeaways: string[];

  completed: boolean;
  quizBestScore?: number;
  quizAttempts: number;
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
  results: QuizSubmitResultItem[];
}
