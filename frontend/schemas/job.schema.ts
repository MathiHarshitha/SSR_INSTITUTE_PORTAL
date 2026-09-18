import { z } from "zod";

export const jobFormSchema = z.object({
  company: z.string().trim().min(2, "Company name is too short").max(150),
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().min(10, "Description is too short").max(5000),
  location: z.string().trim().optional(),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  salaryRange: z.string().trim().optional(),
  skillsText: z.string().optional(),
  minExperienceYears: z.coerce.number().min(0).max(40).optional(),
  educationRequirement: z.string().trim().optional(),
  applicationDeadline: z.string().min(1, "Deadline is required"),
  openings: z.coerce.number().int().min(1, "At least 1 opening is required"),
  jobLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
