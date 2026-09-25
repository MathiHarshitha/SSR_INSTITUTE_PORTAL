import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";
import { refreshSession, revokeSessionByRefreshToken } from "../services/session.service";
import * as authService from "../services/auth.service";
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterStudentInput,
  RegisterTrainerInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../validators/auth.validator";
import {
  UpdateMeInput,
  UpdateStudentProfileInput,
  UpdateTrainerProfileInput,
} from "../validators/profile.validator";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: "/api/v1/auth",
} as const;

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions,
    maxAge: env.sessionTtlDays * 24 * 60 * 60 * 1000,
  });
}

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerStudent(req.body as RegisterStudentInput);
  sendSuccess(res, 201, "Registration submitted. Check your email for a verification code.", result);
});

export const registerTrainer = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerTrainer(req.body as RegisterTrainerInput);
  sendSuccess(res, 201, "Registration submitted. Check your email for a verification code.", result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body as VerifyOtpInput;
  const result = await authService.verifyOtp(email, otp);
  sendSuccess(res, 200, "Email verified. Your account is now awaiting admin approval.", result);
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  await authService.resendOtp(email);
  sendSuccess(res, 200, "If that email has a pending verification, a new code has been sent.");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const result = await authService.login(email, password);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, "Login successful", {
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, 200, "Current user fetched", result);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.updateOwnUser(req.user!.id, req.body as UpdateMeInput);
  sendSuccess(res, 200, "Profile updated", result);
});

export const updateMyStudentProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.updateOwnStudentProfile(
    req.user!.id,
    req.body as UpdateStudentProfileInput
  );
  sendSuccess(res, 200, "Profile updated", profile);
});

export const updateMyTrainerProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.updateOwnTrainerProfile(
    req.user!.id,
    req.body as UpdateTrainerProfileInput
  );
  sendSuccess(res, 200, "Profile updated", profile);
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) {
    throw ApiError.unauthorized("Refresh token missing");
  }

  try {
    const { accessToken, refreshToken } = await refreshSession(token);
    if (refreshToken) setRefreshCookie(res, refreshToken);
    sendSuccess(res, 200, "Token refreshed", { accessToken });
  } catch (error) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    throw error;
  }
});

/** Ends this device's session server-side — the refresh token and every access token issued
 * from it stop working immediately, not just when they expire. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await revokeSessionByRefreshToken(req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined);
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  sendSuccess(res, 200, "Logged out successfully");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.forgotPassword(email);
  sendSuccess(res, 200, "If an account exists with that email, a reset link has been sent.");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, password);
  sendSuccess(res, 200, "Password reset successfully. You can now log in.");
});
