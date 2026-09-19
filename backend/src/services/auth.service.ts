import mongoose from "mongoose";
import { User, IUser } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { Course } from "../models/Course";
import { OTPVerification } from "../models/OTPVerification";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { hashPassword, comparePassword } from "../utils/password";
import { generateOtp, generateSecureToken, hashToken } from "../utils/tokens";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { emailService } from "./email.service";
import { env } from "../config/env";
import { RegisterStudentInput, RegisterTrainerInput } from "../validators/auth.validator";
import {
  UpdateMeInput,
  UpdateStudentProfileInput,
  UpdateTrainerProfileInput,
} from "../validators/profile.validator";

async function createOtpForUser(userId: mongoose.Types.ObjectId, email: string): Promise<void> {
  const otp = generateOtp(6);
  const otpHash = hashToken(otp);
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  await OTPVerification.create({
    user: userId,
    otpHash,
    purpose: "EMAIL_VERIFICATION",
    expiresAt,
  });

  await emailService.sendOtpVerification(email, otp);
}

export async function registerStudent(input: RegisterStudentInput) {
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
          },
        ],
        { session }
      );
    });

    if (!user) throw ApiError.internal("Failed to create student account");
    await createOtpForUser((user as IUser)._id, (user as IUser).email);
    return { userId: (user as IUser)._id.toString(), email: (user as IUser).email };
  } finally {
    await session.endSession();
  }
}

export async function registerTrainer(input: RegisterTrainerInput) {
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
          },
        ],
        { session }
      );
    });

    if (!user) throw ApiError.internal("Failed to create trainer account");
    await createOtpForUser((user as IUser)._id, (user as IUser).email);
    return { userId: (user as IUser)._id.toString(), email: (user as IUser).email };
  } finally {
    await session.endSession();
  }
}

export async function verifyOtp(email: string, otp: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound("Account not found");
  }
  if (user.isEmailVerified) {
    throw ApiError.badRequest("Email is already verified");
  }

  const record = await OTPVerification.findOne({
    user: user._id,
    purpose: "EMAIL_VERIFICATION",
    verified: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    throw ApiError.badRequest("No pending verification found. Please request a new code.");
  }
  if (record.expiresAt < new Date()) {
    throw ApiError.badRequest("Verification code has expired. Please request a new one.");
  }
  if (record.attempts >= 5) {
    throw ApiError.tooMany("Too many incorrect attempts. Please request a new code.");
  }

  if (record.otpHash !== hashToken(otp)) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Invalid verification code");
  }

  record.verified = true;
  await record.save();

  user.isEmailVerified = true;
  await user.save();

  return { status: user.status };
}

export async function resendOtp(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound("Account not found");
  }
  if (user.isEmailVerified) {
    throw ApiError.badRequest("Email is already verified");
  }
  await createOtpForUser(user._id, user.email);
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

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw ApiError.forbidden("Please verify your email before logging in");
  }

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

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, status: user.status });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

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

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email });
  // Do not reveal whether the email exists.
  if (!user) return;

  const { raw, hashed } = generateSecureToken();
  const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

  await PasswordResetToken.create({ user: user._id, tokenHash: hashed, expiresAt });

  const resetUrl = `${env.clientUrl}/reset-password?token=${raw}`;
  await emailService.sendPasswordReset(user.email, resetUrl);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const record = await PasswordResetToken.findOne({ tokenHash, used: false });

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  const user = await User.findById(record.user);
  if (!user) {
    throw ApiError.notFound("Account not found");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  record.used = true;
  await record.save();

  // Invalidate any other outstanding reset tokens for this user.
  await PasswordResetToken.updateMany(
    { user: user._id, used: false, _id: { $ne: record._id } },
    { $set: { used: true } }
  );
}
