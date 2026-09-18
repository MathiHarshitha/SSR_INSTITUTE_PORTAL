import { z } from "zod";

export const taskFormSchema = z.object({
  type: z.enum(["ASSIGNMENT", "QUIZ", "PROJECT"]),
  title: z.string().trim().min(2, "Title is too short").max(200),
  description: z.string().trim().min(5, "Description is too short").max(5000),
  batch: z.string().min(1, "Select a batch"),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.coerce.number().min(0),

  // Assignment
  attachmentUrlsText: z.string().optional(),

  // Quiz — fixed 4-option MCQ per question, kept simple rather than a fully dynamic option builder
  questions: z
    .array(
      z.object({
        question: z.string().trim().min(1, "Question text is required"),
        optionA: z.string().trim().min(1, "Required"),
        optionB: z.string().trim().min(1, "Required"),
        optionC: z.string().trim().min(1, "Required"),
        optionD: z.string().trim().min(1, "Required"),
        correctIndex: z.coerce.number().min(0).max(3),
        marks: z.coerce.number().min(0),
      })
    )
    .optional(),
  timeLimitMinutes: z.coerce.number().min(1).optional(),
  attemptsAllowed: z.coerce.number().min(1).optional(),

  // Project
  requirementsText: z.string().optional(),
  submissionFormat: z.string().trim().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function linesToArray(text?: string): string[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
