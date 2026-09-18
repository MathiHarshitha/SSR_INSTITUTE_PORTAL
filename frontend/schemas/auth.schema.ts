import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerStudentSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    highestQualification: z.string().trim().optional(),
    college: z.string().trim().optional(),
    courseId: z.string().min(1, "Please select a course"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;

export const registerTrainerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    qualification: z.string().trim().optional(),
    specialization: z.string().trim().optional(),
    experienceYears: z.coerce.number().min(0).max(60).optional(),
    skills: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterTrainerFormValues = z.infer<typeof registerTrainerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const verifyOtpSchema = z.object({
  otp: z.string().length(6, "Enter the 6-digit code"),
});
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
