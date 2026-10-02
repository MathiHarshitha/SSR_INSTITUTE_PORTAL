import mongoose from "mongoose";
import { User, IUser } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { Course } from "../models/Course";
import { OTPVerification } from "../models/OTPVerification";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { hashPassword, comparePassword } from "../utils/password";
import { generateOtp, generateSecureToken, hashToken } from "../utils/tokens";
import { createSession, revokeAllSessions } from "./session.service";

/** Compared against when the email doesn't exist, so login takes the same time either way
 * (no user enumeration by response timing). */
let dummyPasswordHash: Promise<string> | null = null;
function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= hashPassword(generateSecureToken(16).raw);
  return dummyPasswordHash;
}
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { emailService, maskEmail } from "./email.service";
import { notifyActiveAdmins, notifySafely } from "./notification.service";
import { recordAudit } from "./auditLog.service";
import { env } from "../config/env";
import { RegisterStudentInput, RegisterTrainerInput } from "../validators/auth.validator";
import {
  UpdateMeInput,
  UpdateStudentProfileInput,
  UpdateTrainerProfileInput,
} from "../validators/profile.validator";

async function createOtpForUser(userId: mongoose.Types.ObjectId, email: string, name: string): Promise<void> {
  const otp = generateOtp(6);
  const otpHash = hashToken(otp);
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  // Only the newest code is ever valid — older outstanding codes are retired.
  await OTPVerification.deleteMany({ user: userId, purpose: "EMAIL_VERIFICATION", verified: false });
  await OTPVerification.create({
    user: userId,
    otpHash,
    purpose: "EMAIL_VERIFICATION",
    expiresAt,
  });

  await emailService.sendOtpVerification(email, name, otp);
}

export async function registerStudent(input: RegisterStudentInput, ipAddress?: string) {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const course = await Course.findOne({ _id: input.courseId, status: "PUBLISHED" }).lean();
  if (!course) {
    throw ApiError.badRequest("Selected course is not available");
  }

  const passwordHash = await hashPassword(input.password);

  const session = await mongoose.startSession();
  try {
    let user: IUser | null = null;
    await session.withTransaction(async () => {
      const [createdUser] = await User.create(
        [
          {
            name: input.name,
            email: input.email,
            phone: input.phone,
            passwordHash,
            role: "STUDENT",
            status: "PENDING",
          },
        ],
        { session }
      );
      user = createdUser;

      await StudentProfile.create(
        [
          {
            user: createdUser._id,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            highestQualification: input.highestQualification,
            college: input.college,
            interestedCourse: input.courseId,
            guardianPhone: input.guardianPhone,
            privacyPolicyAcceptedAt: new Date(),
          },
        ],
        { session }
      );
    });

    if (!user) throw ApiError.internal("Failed to create student account");
    await createOtpForUser((user as IUser)._id, (user as IUser).email, (user as IUser).name);
    await recordAudit({
      userId: (user as IUser)._id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: (user as IUser)._id,
      metadata: { role: "STUDENT" },
      ipAddress,
    });
    return { userId: (user as IUser)._id.toString(), email: (user as IUser).email };
  } finally {
    await session.endSession();
  }
}

export async function registerTrainer(input: RegisterTrainerInput, ipAddress?: string) {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const session = await mongoose.startSession();
  try {
    let user: IUser | null = null;
    await session.withTransaction(async () => {
      const [createdUser] = await User.create(
        [
          {
            name: input.name,
            email: input.email,
            phone: input.phone,
            passwordHash,
            role: "TRAINER",
            status: "PENDING",
          },
        ],
        { session }
      );
      user = createdUser;

      await TrainerProfile.create(
        [
          {
            user: createdUser._id,
            qualification: input.qualification,
            skills: input.skills ?? [],
            specialization: input.specialization,
            experienceYears: input.experienceYears,
            resumeUrl: input.resumeUrl,
            alternatePhone: input.alternatePhone,
            privacyPolicyAcceptedAt: new Date(),
          },
        ],
        { session }
      );
    });

    if (!user) throw ApiError.internal("Failed to create trainer account");
    await createOtpForUser((user as IUser)._id, (user as IUser).email, (user as IUser).name);
    await recordAudit({
      userId: (user as IUser)._id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: (user as IUser)._id,
      metadata: { role: "TRAINER" },
      ipAddress,
    });
    return { userId: (user as IUser)._id.toString(), email: (user as IUser).email };
  } finally {
    await session.endSession();
  }
}

/** Same response whether the email is unknown, already verified, or has no pending code — the
 * OTP endpoints must not reveal which emails have accounts. */
const INVALID_OTP_MESSAGE = "Invalid or expired verification code. Please request a new code.";
const MAX_OTP_ATTEMPTS = 5;

export async function verifyOtp(email: string, otp: string, ipAddress?: string) {
  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified) {
    throw ApiError.badRequest(INVALID_OTP_MESSAGE);
  }

  // Claims one attempt atomically before comparing, so concurrent guesses can't all slip in
  // under the limit. No match covers missing, expired and exhausted codes alike — the
  // exhausted case gets the same generic answer too, since an unknown email could never
  // produce a distinct "too many attempts" response.
  const record = await OTPVerification.findOneAndUpdate(
    {
      user: user._id,
      purpose: "EMAIL_VERIFICATION",
      verified: false,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_OTP_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { new: true, sort: { createdAt: -1 } }
  );
  if (!record || record.otpHash !== hashToken(otp)) {
    throw ApiError.badRequest(INVALID_OTP_MESSAGE);
  }

  // Conditional so a code can only ever be redeemed once.
  const redeemed = await OTPVerification.findOneAndUpdate(
    { _id: record._id, verified: false },
    { $set: { verified: true } }
  );
  if (!redeemed) {
    throw ApiError.badRequest(INVALID_OTP_MESSAGE);
  }

  user.isEmailVerified = true;
  await user.save();
  await recordAudit({ userId: user._id, action: "EMAIL_VERIFIED", entity: "User", entityId: user._id, ipAddress });

  // Notified here rather than at registration: only now is the account ready for review, and
  // unverified (possibly bogus) sign-ups don't spam the admins.
  if (user.status === "PENDING") {
    await notifySafely(() =>
      notifyActiveAdmins({
        type: "USER_PENDING_APPROVAL",
        title: `New ${user.role.toLowerCase()} awaiting approval`,
        message: `${user.name} (${user.email}) registered as a ${user.role.toLowerCase()} and needs your approval.`,
        link: `/admin/users?preset=pending&view=${user._id}`,
      })
    );
  }

  return { status: user.status };
}

/** Always "succeeds" from the caller's point of view; a code is only sent when there's an
 * unverified account for this email (no account enumeration). The code is issued and mailed
 * off the request path, so response time doesn't reveal whether that happened either. */
export async function resendOtp(email: string) {
  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified) return;
  void createOtpForUser(user._id, user.email, user.name).catch((error) =>
    logger.error("Failed to resend verification code", error)
  );
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export async function login(email: string, password: string, ipAddress?: string): Promise<LoginResult> {
  /** Not awaited, so recording a failure doesn't change response timing. Never the password. */
  const recordFailure = (reason: string, userId?: mongoose.Types.ObjectId) =>
    void recordAudit({
      userId,
      action: "LOGIN_FAILED",
      entity: "User",
      entityId: userId,
      metadata: { email: maskEmail(email), reason },
      ipAddress,
    });

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    await comparePassword(password, await getDummyPasswordHash());
    recordFailure("unknown_account");
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    recordFailure("bad_credentials", user._id);
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    recordFailure("email_unverified", user._id);
    throw ApiError.forbidden("Please verify your email before logging in");
  }

  if (user.status !== "ACTIVE") recordFailure(`status_${user.status.toLowerCase()}`, user._id);
  if (user.status === "PENDING") {
    throw ApiError.forbidden("Your account is awaiting admin approval");
  }
  if (user.status === "REJECTED") {
    throw ApiError.forbidden("Your registration was rejected. Contact the institute for details.");
  }
  if (user.status === "BLOCKED") {
    throw ApiError.forbidden("Your account has been blocked. Contact the institute for details.");
  }
  if (user.status === "SUSPENDED") {
    throw ApiError.forbidden("Your account is currently suspended.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { accessToken, refreshToken } = await createSession(user);
  await recordAudit({ userId: user._id, action: "LOGIN_SUCCESS", entity: "User", entityId: user._id, ipAddress });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw ApiError.notFound("Account not found");
  }

  let profile = null;
  if (user.role === "STUDENT") {
    profile = await StudentProfile.findOne({ user: user._id }).lean();
  } else if (user.role === "TRAINER") {
    profile = await TrainerProfile.findOne({ user: user._id }).lean();
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    profile,
  };
}

export async function updateOwnUser(userId: string, input: UpdateMeInput) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Account not found");

  const { avatarUrl, ...rest } = input;
  Object.assign(user, rest);
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || undefined;
  await user.save();

  return getCurrentUser(userId);
}

export async function updateOwnStudentProfile(userId: string, input: UpdateStudentProfileInput) {
  const user = await User.findById(userId).select("role").lean();
  if (!user || user.role !== "STUDENT") throw ApiError.forbidden("Only students have this profile");

  const sanitized = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== "")
  );

  const profile = await StudentProfile.findOneAndUpdate(
    { user: userId },
    { $set: sanitized },
    { new: true, upsert: true }
  );

  return profile;
}

export async function updateOwnTrainerProfile(userId: string, input: UpdateTrainerProfileInput) {
  const user = await User.findById(userId).select("role").lean();
  if (!user || user.role !== "TRAINER") throw ApiError.forbidden("Only trainers have this profile");

  const sanitized = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== "")
  );

  const profile = await TrainerProfile.findOneAndUpdate(
    { user: userId },
    { $set: sanitized },
    { new: true, upsert: true }
  );

  return profile;
}

async function issuePasswordReset(user: IUser, ipAddress?: string): Promise<void> {
  const { raw, hashed } = generateSecureToken();
  const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

  await PasswordResetToken.create({ user: user._id, tokenHash: hashed, expiresAt });
  await recordAudit({ userId: user._id, action: "PASSWORD_RESET_REQUESTED", entity: "User", entityId: user._id, ipAddress });

  const resetUrl = `${env.clientUrl}/reset-password?token=${raw}`;
  await emailService.sendPasswordReset(user.email, resetUrl);
}

export async function forgotPassword(email: string, ipAddress?: string): Promise<void> {
  const user = await User.findOne({ email });
  // Do not reveal whether the email exists — neither in the response nor its timing, so the
  // token is issued and mailed off the request path.
  if (!user) return;
  void issuePasswordReset(user, ipAddress).catch((error) => logger.error("Failed to issue password reset", error));
}

export async function resetPassword(rawToken: string, newPassword: string, ipAddress?: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  // Claimed atomically before anything else, so one link can't be redeemed twice concurrently.
  const record = await PasswordResetToken.findOneAndUpdate(
    { tokenHash, used: false, expiresAt: { $gt: new Date() } },
    { $set: { used: true } }
  );
  if (!record) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  const user = await User.findById(record.user);
  if (!user) {
    throw ApiError.notFound("Account not found");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // Whoever knew the old password (or holds a stolen session) is signed out everywhere.
  await revokeAllSessions(user._id);

  // Invalidate any other outstanding reset tokens for this user.
  await PasswordResetToken.updateMany(
    { user: user._id, used: false, _id: { $ne: record._id } },
    { $set: { used: true } }
  );

  await recordAudit({ userId: user._id, action: "PASSWORD_RESET_COMPLETED", entity: "User", entityId: user._id, ipAddress });
}
