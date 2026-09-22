import { z } from "zod";
import { linesToArray } from "./course.schema";

export { linesToArray, arrayToLines } from "./course.schema";

export const moduleFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().optional(),
  estimatedDuration: z.string().trim().optional(),
});
export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const topicFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().optional(),
});
export type TopicFormValues = z.infer<typeof topicFormSchema>;

const codeExampleFormSchema = z.object({
  title: z.string().trim().optional(),
  language: z.string().trim().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  explanation: z.string().trim().optional(),
});

const commonMistakeFormSchema = z.object({
  wrong: z.string().trim().min(1, "Required"),
  right: z.string().trim().min(1, "Required"),
  explanation: z.string().trim().optional(),
});

const quizQuestionFormSchema = z.object({
  question: z.string().trim().min(1, "Required"),
  optionsText: z.string().trim().min(1, "Enter at least 2 options, one per line"),
  correctOptionNumber: z.coerce.number().int().min(1, "Must be 1 or higher"),
  explanation: z.string().trim().optional(),
});

function isValidJson(value: string): boolean {
  if (!value.trim()) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

const codingTestCaseFormSchema = z.object({
  argsText: z.string().trim().refine(isValidJson, "Must be a valid JSON array, e.g. [1, 2]"),
  expectedOutputText: z.string().trim().refine(isValidJson, "Must be valid JSON, e.g. 3 or \"text\""),
});

export const lessonContentFormSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().optional(),
  estimatedMinutes: z.coerce.number().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  published: z.boolean(),

  whatIsIt: z.string().trim().optional(),
  whyItMatters: z.string().trim().optional(),
  analogy: z.string().trim().optional(),
  simpleExample: z.string().trim().optional(),
  technicalExplanation: z.string().trim().optional(),
  codeExamples: z.array(codeExampleFormSchema),
  realWorldUsage: z.string().trim().optional(),
  commonMistakes: z.array(commonMistakeFormSchema),
  practiceInstructions: z.string().trim().optional(),
  practiceStarterCode: z.string().optional(),
  practiceHint: z.string().trim().optional(),
  quiz: z.array(quizQuestionFormSchema),
  codingPrompt: z.string().trim().optional(),
  codingStarterCode: z.string().optional(),
  codingFunctionName: z
    .string()
    .trim()
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Must be a valid function name")
    .optional()
    .or(z.literal("")),
  codingTestCases: z.array(codingTestCaseFormSchema),
  rememberThis: z.string().trim().optional(),
  keyTakeawaysText: z.string().optional(),
});
export type LessonContentFormValues = z.infer<typeof lessonContentFormSchema>;

/** Converts a quiz row's newline-separated options text + 1-based correct option number
 * into the {options, correctIndex} shape the API expects. */
export function toQuizQuestion(row: z.infer<typeof quizQuestionFormSchema>) {
  return {
    question: row.question,
    options: linesToArray(row.optionsText),
    correctIndex: Math.max(0, row.correctOptionNumber - 1),
    explanation: row.explanation || undefined,
  };
}

export function fromQuizQuestion(q: { question: string; options: string[]; correctIndex: number; explanation?: string }) {
  return {
    question: q.question,
    optionsText: q.options.join("\n"),
    correctOptionNumber: q.correctIndex + 1,
    explanation: q.explanation ?? "",
  };
}

export function toCodingTestCase(row: z.infer<typeof codingTestCaseFormSchema>) {
  return {
    args: JSON.parse(row.argsText) as unknown[],
    expectedOutput: JSON.parse(row.expectedOutputText) as unknown,
  };
}

export function fromCodingTestCase(tc: { args: unknown[]; expectedOutput: unknown }) {
  return {
    argsText: JSON.stringify(tc.args),
    expectedOutputText: JSON.stringify(tc.expectedOutput),
  };
}
