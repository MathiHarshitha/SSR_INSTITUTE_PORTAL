import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse, AuthUser, LoginResponse } from "@/types/auth";
import {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterStudentFormValues,
  RegisterTrainerFormValues,
} from "@/schemas/auth.schema";
import {
  StudentProfileData,
  TrainerProfileData,
  UpdateMeInput,
  UpdateStudentProfileInput,
  UpdateTrainerProfileInput,
} from "@/types/profile";

/** Empty strings from untouched optional inputs (date/select) must become
 * `undefined` so JSON.stringify drops them — the backend's `.optional()`
 * Zod schemas accept a missing field but reject a literal empty string. */
function pruneEmptyStrings<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (result[key] === "") {
      delete result[key];
    }
  }
  return result;
}

export const authService = {
  async registerStudent(input: RegisterStudentFormValues) {
    const { confirmPassword: _confirmPassword, ...payload } = input;
    void _confirmPassword;
    const { data } = await apiClient.post<ApiSuccessResponse<{ userId: string; email: string }>>(
      "/auth/register/student",
      pruneEmptyStrings(payload)
    );
    return data.data;
  },

  async registerTrainer(input: RegisterTrainerFormValues) {
    const { confirmPassword: _confirmPassword, skills, ...rest } = input;
    void _confirmPassword;
    const payload = { ...rest, skills: skills ? skills.split(",").map((s) => s.trim()) : undefined };
    const { data } = await apiClient.post<ApiSuccessResponse<{ userId: string; email: string }>>(
      "/auth/register/trainer",
      payload
    );
    return data.data;
  },

  async verifyOtp(email: string, otp: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ status: string }>>("/auth/verify-otp", {
      email,
      otp,
    });
    return data.data;
  },

  async resendOtp(email: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<null>>("/auth/resend-otp", { email });
    return data.message;
  },

  async login(input: LoginFormValues) {
    const { data } = await apiClient.post<ApiSuccessResponse<LoginResponse>>("/auth/login", input);
    return data.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async forgotPassword(input: ForgotPasswordFormValues) {
    const { data } = await apiClient.post<ApiSuccessResponse<null>>("/auth/forgot-password", input);
    return data.message;
  },

  async resetPassword(token: string, password: string, confirmPassword: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<null>>("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
    return data.message;
  },

  async getMe() {
    const { data } = await apiClient.get<ApiSuccessResponse<AuthUser>>("/auth/me");
    return data.data;
  },

  async updateMe(input: UpdateMeInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AuthUser>>("/auth/me", input);
    return data.data;
  },

  async updateStudentProfile(input: UpdateStudentProfileInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<StudentProfileData>>(
      "/auth/me/student-profile",
      pruneEmptyStrings(input)
    );
    return data.data;
  },

  async updateTrainerProfile(input: UpdateTrainerProfileInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<TrainerProfileData>>(
      "/auth/me/trainer-profile",
      pruneEmptyStrings(input)
    );
    return data.data;
  },
};
