import { z } from "zod";

export const classFormSchema = z.object({
  batch: z.string().min(1, "Select a batch"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  topic: z.string().trim().min(2, "Topic is too short").max(200),
  description: z.string().trim().optional(),
  meetingLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().trim().optional(),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
