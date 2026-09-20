/** Shared shape every course's curriculum-definition file must conform to (compile-time
 * enforced) — mirrors the Lesson/Module schema fields 1:1 so `seedCurriculum()` in seed.ts
 * can upsert them directly. */

export interface CurriculumCodeExample {
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface CurriculumCommonMistake {
  wrong: string;
  right: string;
  explanation?: string;
}

export interface CurriculumPractice {
  instructions: string;
  starterCode?: string;
  hint?: string;
}

export interface CurriculumQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface CurriculumLessonDef {
  title: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  whatIsIt: string;
  whyItMatters: string;
  analogy: string;
  simpleExample: string;
  technicalExplanation?: string;
  codeExamples?: CurriculumCodeExample[];
  realWorldUsage?: string;
  commonMistakes?: CurriculumCommonMistake[];
  practice?: CurriculumPractice | null;
  quiz?: CurriculumQuizQuestion[];
  rememberThis?: string;
  keyTakeaways?: string[];
}

export interface CurriculumTopicDef {
  name: string;
  description?: string;
  lessons: CurriculumLessonDef[];
}

export interface CurriculumModuleDef {
  name: string;
  description?: string;
  estimatedDuration?: string;
  /** Preferred: lessons grouped into named topics (Course -> Module -> Topic -> Lesson). */
  topics?: CurriculumTopicDef[];
  /** Legacy shape: a flat lesson list with no topic grouping. `seedCurriculum()` wraps these
   * into a single auto-generated topic per module so existing curriculum files keep working
   * without a manual rewrite. Prefer `topics` for new/updated curriculum content. */
  lessons?: CurriculumLessonDef[];
}

export interface CurriculumCourseDef {
  /** Must match a seeded Course.name exactly. */
  courseName: string;
  modules: CurriculumModuleDef[];
}
