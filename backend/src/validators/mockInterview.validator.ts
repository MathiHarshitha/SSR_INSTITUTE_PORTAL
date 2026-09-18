import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const INTERVIEW_TYPES = ["TECHNICAL", "HR", "COMMUNICATION", "PROJECT_REVIEW", "APTITUDE"] as const;
const INTERVIEW_RESULTS = ["PENDING", "RECOMMENDED", "NOT_RECOMMENDED"] as const;

export const scheduleInterviewSchema = z.object({
  student: OBJECT_ID,
  batch: OBJECT_ID.optional(),
  date: z.coerce.date(),
  time: z.string().trim().min(1, "Time is required"),
  meetingLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  type: z.enum(INTERVIEW_TYPES),
  topics: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateInterviewSchema = z.object({
  date: z.coerce.date().optional(),
  time: z.string().trim().min(1).optional(),
  meetingLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  type: z.enum(INTERVIEW_TYPES).optional(),
  topics: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const recordFeedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  strengths: z.string().trim().max(1000).optional(),
  weaknesses: z.string().trim().max(1000).optional(),
  feedback: z.string().trim().max(2000).optional(),
  recommendation: z.string().trim().max(1000).optional(),
  result: z.enum(INTERVIEW_RESULTS),
});

export const listInterviewsQuerySchema = z.object({
  student: OBJECT_ID.optional(),
  interviewer: OBJECT_ID.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type RecordFeedbackInput = z.infer<typeof recordFeedbackSchema>;
export type ListInterviewsQuery = z.infer<typeof listInterviewsQuerySchema>;
