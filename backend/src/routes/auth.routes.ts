import { NextFunction, Request, Response, Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { authLimiter, loginAccountLimiter, otpLimiter, refreshLimiter } from "../middleware/rateLimiters";
import { env } from "../config/env";
import { sendError } from "../utils/apiResponse";
import {
  forgotPasswordSchema,
  loginSchema,
  registerStudentSchema,
  registerTrainerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validator";
import {
  updateMeSchema,
  updateStudentProfileSchema,
  updateTrainerProfileSchema,
} from "../validators/profile.validator";
import { z } from "zod";

const router = Router();

/** Login/refresh/logout set or clear the refresh cookie, which the browser attaches to
 * cross-site requests too (SameSite=None in split deployments). Browsers always send `Origin`
 * on cross-origin POSTs, so a foreign one is rejected (login / forced-logout CSRF). Requests
 * without an Origin (curl, server-to-server) carry no ambient browser cookies and pass. */
function requireAllowedOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (origin !== undefined && !env.corsOrigins.includes(origin)) {
    sendError(res, 403, "Request origin not allowed");
    return;
  }
  next();
}

router.post(
  "/register/student",
  authLimiter,
  validateBody(registerStudentSchema),
  authController.registerStudent
);
router.post(
  "/register/trainer",
  authLimiter,
  validateBody(registerTrainerSchema),
  authController.registerTrainer
);

router.post("/verify-otp", authLimiter, validateBody(verifyOtpSchema), authController.verifyOtp);
router.post(
  "/resend-otp",
  otpLimiter,
  validateBody(z.object({ email: z.string().trim().toLowerCase().email() })),
  authController.resendOtp
);

router.post(
  "/login",
  requireAllowedOrigin,
  authLimiter,
  loginAccountLimiter,
  validateBody(loginSchema),
  authController.login
);
router.post("/refresh-token", requireAllowedOrigin, refreshLimiter, authController.refreshAccessToken);
router.post("/logout", requireAllowedOrigin, refreshLimiter, authController.logout);

router.post(
  "/forgot-password",
  otpLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

router.get("/me", authenticate, authController.getMe);
router.patch("/me", authenticate, validateBody(updateMeSchema), authController.updateMe);
router.patch(
  "/me/student-profile",
  authenticate,
  authorize("STUDENT"),
  validateBody(updateStudentProfileSchema),
  authController.updateMyStudentProfile
);
router.patch(
  "/me/trainer-profile",
  authenticate,
  authorize("TRAINER"),
  validateBody(updateTrainerProfileSchema),
  authController.updateMyTrainerProfile
);

export default router;
