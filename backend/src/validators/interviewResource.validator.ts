import { z } from "zod";
import { httpUrl } from "./common";

export const createInterviewResourceSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  course: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course id"),
  fileUrl: httpUrl().optional(),
  status: z.enum(["COMING_SOON", "PUBLISHED"]).optional(),
});

export const updateInterviewResourceSchema = createInterviewResourceSchema.partial();

export type CreateInterviewResourceInput = z.infer<typeof createInterviewResourceSchema>;
export type UpdateInterviewResourceInput = z.infer<typeof updateInterviewResourceSchema>;
