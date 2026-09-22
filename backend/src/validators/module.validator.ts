import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createModuleSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().max(2000).optional(),
  estimatedDuration: z.string().trim().max(60).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModulesSchema = z.object({
  orderedIds: z.array(OBJECT_ID).min(1),
});

export const createTopicSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().max(2000).optional(),
});

export const updateTopicSchema = createTopicSchema.partial();

export const reorderTopicsSchema = z.object({
  orderedIds: z.array(OBJECT_ID).min(1),
});

const codeExampleSchema = z.object({
  title: z.string().trim().max(150).optional(),
  language: z.string().trim().min(1).max(40),
  code: z.string().min(1),
  explanation: z.string().trim().max(3000).optional(),
});

const commonMistakeSchema = z.object({
  wrong: z.string().min(1),
  right: z.string().min(1),
  explanation: z.string().trim().max(2000).optional(),
});

const practiceSchema = z.object({
  instructions: z.string().min(1),
  starterCode: z.string().optional(),
  hint: z.string().trim().max(1000).optional(),
});

const quizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(500),
  options: z.array(z.string().trim().min(1)).min(2).max(6),
  correctIndex: z.coerce.number().int().min(0),
  explanation: z.string().trim().max(1000).optional(),
});

const codingTestCaseSchema = z.object({
  args: z.array(z.unknown()).default([]),
  expectedOutput: z.unknown(),
});

const codingQuestionSchema = z.object({
  prompt: z.string().min(1),
  starterCode: z.string().min(1),
  functionName: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Must be a valid JS identifier"),
  testCases: z.array(codingTestCaseSchema).min(1),
});

// No `.default()` in this base — it's reused via `.partial()` for updates, and a
// `.default()` fires even on an omitted key there, silently reintroducing/wiping
// array fields the caller never sent (same gotcha documented in course.validator.ts).
const lessonFieldsBase = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().max(2000).optional(),
  estimatedMinutes: z.coerce.number().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  published: z.coerce.boolean().optional(),

  whatIsIt: z.string().trim().max(3000).optional(),
  whyItMatters: z.string().trim().max(3000).optional(),
  analogy: z.string().trim().max(3000).optional(),
  simpleExample: z.string().trim().max(3000).optional(),
  technicalExplanation: z.string().trim().max(5000).optional(),
  codeExamples: z.array(codeExampleSchema).optional(),
  realWorldUsage: z.string().trim().max(3000).optional(),
  commonMistakes: z.array(commonMistakeSchema).optional(),
  practice: practiceSchema.nullable().optional(),
  quiz: z.array(quizQuestionSchema).optional(),
  codingQuestion: codingQuestionSchema.nullable().optional(),
  rememberThis: z.string().trim().max(500).optional(),
  keyTakeaways: z.array(z.string().trim().min(1)).optional(),
});

export const createLessonSchema = lessonFieldsBase.extend({
  codeExamples: z.array(codeExampleSchema).optional().transform((v) => v ?? []),
  commonMistakes: z.array(commonMistakeSchema).optional().transform((v) => v ?? []),
  quiz: z.array(quizQuestionSchema).optional().transform((v) => v ?? []),
  keyTakeaways: z.array(z.string().trim().min(1)).optional().transform((v) => v ?? []),
});

export const updateLessonSchema = lessonFieldsBase.partial();

export const reorderLessonsSchema = z.object({
  orderedIds: z.array(OBJECT_ID).min(1),
});

/** @deprecated bulk-answers submission has been replaced by the session-based
 * start/answer/submit/quit flow (spec §7 anti-cheat) — kept only so old type imports
 * don't break; no route uses it any more. */
export const submitQuizSchema = z.object({
  answers: z.array(z.coerce.number().int().min(0)),
});

export const answerQuizQuestionSchema = z.object({
  selectedIndex: z.coerce.number().int().min(0),
});

export const submitCodingAnswerSchema = z.object({
  code: z.string().min(1).max(20000),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
