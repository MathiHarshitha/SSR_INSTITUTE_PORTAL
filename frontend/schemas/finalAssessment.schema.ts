import { z } from "zod";
import { linesToArray } from "./course.schema";

const finalAssessmentQuestionFormSchema = z.object({
  question: z.string().trim().min(1, "Required"),
  optionsText: z.string().trim().min(1, "Enter at least 2 options, one per line"),
  correctOptionNumber: z.coerce.number().int().min(1, "Must be 1 or higher"),
  explanation: z.string().trim().optional(),
});

export const finalAssessmentFormSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  passingScore: z.coerce.number().int().min(0).max(100),
  published: z.boolean(),
  questions: z.array(finalAssessmentQuestionFormSchema).min(1, "Add at least one question"),
});
export type FinalAssessmentFormValues = z.infer<typeof finalAssessmentFormSchema>;

export function toFinalAssessmentQuestion(row: z.infer<typeof finalAssessmentQuestionFormSchema>) {
  return {
    question: row.question,
    options: linesToArray(row.optionsText),
    correctIndex: Math.max(0, row.correctOptionNumber - 1),
    explanation: row.explanation || undefined,
  };
}

export function fromFinalAssessmentQuestion(q: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  return {
    question: q.question,
    optionsText: q.options.join("\n"),
    correctOptionNumber: q.correctIndex + 1,
    explanation: q.explanation ?? "",
  };
}
