import { z } from "zod";
import { httpUrl } from "./common";
import { GENDERS } from "../constants/enums";

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number")
    .optional(),
  avatarUrl: httpUrl("Must be a valid URL").optional().or(z.literal("")),
});

export const updateStudentProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(GENDERS).optional(),
  address: z.string().trim().max(300).optional(),
  highestQualification: z.string().trim().max(200).optional(),
  college: z.string().trim().max(200).optional(),
  graduationYear: z.coerce.number().min(1950).max(2100).optional(),
  percentageOrCgpa: z.string().trim().max(20).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  experience: z.string().trim().max(500).optional(),
  resumeUrl: httpUrl().optional().or(z.literal("")),
  portfolioUrl: httpUrl().optional().or(z.literal("")),
  linkedinUrl: httpUrl().optional().or(z.literal("")),
  githubUrl: httpUrl().optional().or(z.literal("")),
});

export const updateTrainerProfileSchema = z.object({
  qualification: z.string().trim().max(200).optional(),
  specialization: z.string().trim().max(200).optional(),
  experienceYears: z.coerce.number().min(0).max(60).optional(),
  bio: z.string().trim().max(1000).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  resumeUrl: httpUrl().optional().or(z.literal("")),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateTrainerProfileInput = z.infer<typeof updateTrainerProfileSchema>;
