import { z } from "zod";
import { httpUrl } from "./common";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createClassScheduleSchema = z.object({
  batch: OBJECT_ID,
  module: OBJECT_ID.optional(),
  date: z.coerce.date(),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
  topic: z.string().trim().min(2, "Topic is too short").max(200),
  description: z.string().trim().max(1000).optional(),
  meetingLink: httpUrl("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
});

export const updateClassScheduleSchema = z.object({
  module: OBJECT_ID.optional(),
  date: z.coerce.date().optional(),
  startTime: z.string().trim().min(1).optional(),
  endTime: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  meetingLink: httpUrl("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
});

export const listClassSchedulesQuerySchema = z.object({
  batch: OBJECT_ID.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateClassScheduleInput = z.infer<typeof createClassScheduleSchema>;
export type UpdateClassScheduleInput = z.infer<typeof updateClassScheduleSchema>;
export type ListClassSchedulesQuery = z.infer<typeof listClassSchedulesQuerySchema>;
