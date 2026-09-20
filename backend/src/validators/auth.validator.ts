import { z } from "zod";
import { GENDERS } from "../constants/enums";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

const baseRegisterFields = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number"),
  password: passwordSchema,
  confirmPassword: z.string().optional(),
};

export const registerStudentSchema = z
  .object({
    ...baseRegisterFields,
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(GENDERS).optional(),
    highestQualification: z.string().trim().max(200).optional(),
    college: z.string().trim().max(200).optional(),
    courseId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, "Select a valid course"),
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.password === data.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

export const registerTrainerSchema = z
  .object({
    ...baseRegisterFields,
    qualification: z.string().trim().max(200).optional(),
    skills: z.array(z.string().trim()).optional(),
    experienceYears: z.coerce.number().min(0).max(60).optional(),
    specialization: z.string().trim().max(200).optional(),
    resumeUrl: z.string().trim().url().optional(),
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.password === data.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().length(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterTrainerInput = z.infer<typeof registerTrainerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
