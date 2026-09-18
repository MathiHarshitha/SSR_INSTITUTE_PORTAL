import { z } from "zod";

export const basicInfoSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number"),
});
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export const studentProfileFormSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().trim().optional(),
  highestQualification: z.string().trim().optional(),
  college: z.string().trim().optional(),
  graduationYear: z.coerce.number().optional(),
  percentageOrCgpa: z.string().trim().optional(),
  skillsText: z.string().optional(),
  experience: z.string().trim().optional(),
  resumeUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});
export type StudentProfileFormValues = z.infer<typeof studentProfileFormSchema>;

export const trainerProfileFormSchema = z.object({
  qualification: z.string().trim().optional(),
  specialization: z.string().trim().optional(),
  experienceYears: z.coerce.number().optional(),
  bio: z.string().trim().optional(),
  skillsText: z.string().optional(),
  resumeUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
});
export type TrainerProfileFormValues = z.infer<typeof trainerProfileFormSchema>;
