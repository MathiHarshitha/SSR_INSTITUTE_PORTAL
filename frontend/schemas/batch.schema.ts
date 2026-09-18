import { z } from "zod";

const CLASS_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const batchFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(150),
    course: z.string().min(1, "Select a course"),
    trainer: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    classDays: z.array(z.enum(CLASS_DAYS)).min(1, "Select at least one class day"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
    location: z.string().trim().optional(),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type BatchFormValues = z.infer<typeof batchFormSchema>;

export const CLASS_DAY_OPTIONS = CLASS_DAYS;
