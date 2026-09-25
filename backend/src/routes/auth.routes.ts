import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { authLimiter, otpLimiter, refreshLimiter } from "../middleware/rateLimiters";
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

router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.post("/refresh-token", refreshLimiter, authController.refreshAccessToken);
router.post("/logout", refreshLimiter, authController.logout);

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
