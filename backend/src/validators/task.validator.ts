import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const TASK_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"] as const;

const baseTaskFields = {
  title: z.string().trim().min(2, "Title is too short").max(200),
  description: z.string().trim().min(5, "Description is too short").max(5000),
  batch: OBJECT_ID,
  module: OBJECT_ID.optional(),
  dueDate: z.coerce.date(),
  maxMarks: z.coerce.number().min(0),
};

const quizOptionSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  question: z.string().trim().min(1),
  options: z.array(quizOptionSchema).min(2, "Each question needs at least 2 options"),
  marks: z.coerce.number().min(0),
});

export const createTaskSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ASSIGNMENT"),
    ...baseTaskFields,
    attachmentUrls: z.array(z.string().trim().url()).optional(),
  }),
  z.object({
    type: z.literal("QUIZ"),
    ...baseTaskFields,
    questions: z.array(quizQuestionSchema).min(1, "Add at least one question"),
    timeLimitMinutes: z.coerce.number().min(1).optional(),
    attemptsAllowed: z.coerce.number().min(1).optional(),
  }),
  z.object({
    type: z.literal("PROJECT"),
    ...baseTaskFields,
    requirements: z.array(z.string().trim().min(1)).optional(),
    submissionFormat: z.string().trim().optional(),
  }),
]);

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(5).max(5000).optional(),
  module: OBJECT_ID.optional(),
  dueDate: z.coerce.date().optional(),
  maxMarks: z.coerce.number().min(0).optional(),
  attachmentUrls: z.array(z.string().trim().url()).optional(),
  questions: z.array(quizQuestionSchema).optional(),
  timeLimitMinutes: z.coerce.number().min(1).optional(),
  attemptsAllowed: z.coerce.number().min(1).optional(),
  requirements: z.array(z.string().trim().min(1)).optional(),
  submissionFormat: z.string().trim().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export const listTasksQuerySchema = z.object({
  batch: OBJECT_ID.optional(),
  status: z.enum(TASK_STATUSES).optional(),
  type: z.enum(["ASSIGNMENT", "QUIZ", "PROJECT"]).optional(),
});

export const evaluateSubmissionSchema = z.object({
  marks: z.coerce.number().min(0),
  feedback: z.string().trim().max(2000).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type EvaluateSubmissionInput = z.infer<typeof evaluateSubmissionSchema>;
