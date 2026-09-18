import { z } from "zod";

export const scheduleInterviewFormSchema = z.object({
  student: z.string().min(1, "Select a student"),
  batch: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  meetingLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  type: z.enum(["TECHNICAL", "HR", "COMMUNICATION", "PROJECT_REVIEW", "APTITUDE"]),
  topicsText: z.string().optional(),
  notes: z.string().trim().optional(),
});
export type ScheduleInterviewFormValues = z.infer<typeof scheduleInterviewFormSchema>;

export const feedbackFormSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  strengths: z.string().trim().optional(),
  weaknesses: z.string().trim().optional(),
  feedback: z.string().trim().optional(),
  recommendation: z.string().trim().optional(),
  result: z.enum(["PENDING", "RECOMMENDED", "NOT_RECOMMENDED"]),
});
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
