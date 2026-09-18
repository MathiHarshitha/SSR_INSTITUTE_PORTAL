import { z } from "zod";

export const announcementFormSchema = z
  .object({
    title: z.string().trim().min(2, "Title is too short").max(200),
    content: z.string().trim().min(5, "Content is too short").max(5000),
    audience: z.enum(["EVERYONE", "STUDENTS", "TRAINERS", "BATCH", "COURSE"]),
    batch: z.string().optional(),
    course: z.string().optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH"]),
    expiresAt: z.string().optional(),
  })
  .refine((data) => data.audience !== "BATCH" || !!data.batch, {
    message: "Select a batch",
    path: ["batch"],
  })
  .refine((data) => data.audience !== "COURSE" || !!data.course, {
    message: "Select a course",
    path: ["course"],
  });

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
