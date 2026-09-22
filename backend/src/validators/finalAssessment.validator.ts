import { z } from "zod";

const quizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(500),
  options: z.array(z.string().trim().min(1)).min(2).max(6),
  correctIndex: z.coerce.number().int().min(0),
  explanation: z.string().trim().max(1000).optional(),
});

export const createFinalAssessmentSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  questions: z.array(quizQuestionSchema).min(1).max(100),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
  published: z.coerce.boolean().optional(),
});

export const updateFinalAssessmentSchema = createFinalAssessmentSchema.partial();

export const answerFinalAssessmentSchema = z.object({
  selectedIndex: z.coerce.number().int().min(0),
});

export type CreateFinalAssessmentInput = z.infer<typeof createFinalAssessmentSchema>;
export type UpdateFinalAssessmentInput = z.infer<typeof updateFinalAssessmentSchema>;
