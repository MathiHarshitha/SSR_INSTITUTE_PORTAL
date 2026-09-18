import { FilterQuery } from "mongoose";
import { User, IUser } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { TrainerProfile } from "../models/TrainerProfile";
import { ApiError } from "../utils/ApiError";
import { emailService } from "./email.service";
import { recordAudit } from "./auditLog.service";
import { ListUsersQuery } from "../validators/user.validator";
import { UserStatus } from "../constants/enums";

export async function listUsers(query: ListUsersQuery) {
  const filter: FilterQuery<IUser> = {};

  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, total };
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw ApiError.notFound("User not found");

  let profile = null;
  if (user.role === "STUDENT") {
    profile = await StudentProfile.findOne({ user: user._id }).lean();
  } else if (user.role === "TRAINER") {
    profile = await TrainerProfile.findOne({ user: user._id }).lean();
  }

  return { ...user, profile };
}

async function assertPending(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.status !== "PENDING") {
    throw ApiError.badRequest(`User is already ${user.status.toLowerCase()}`);
  }
  return user;
}

export async function approveUser(adminId: string, userId: string) {
  const user = await assertPending(userId);
  user.status = "ACTIVE";
  user.rejectionReason = undefined;
  await user.save();

  await emailService.sendAccountApproved(user.email, user.name);
  await recordAudit({ userId: adminId, action: "USER_APPROVED", entity: "User", entityId: user._id });

  return user;
}

export async function rejectUser(adminId: string, userId: string, reason?: string) {
  const user = await assertPending(userId);
  user.status = "REJECTED";
  user.rejectionReason = reason;
  await user.save();

  await emailService.sendAccountRejected(user.email, user.name, reason);
  await recordAudit({
    userId: adminId,
    action: "USER_REJECTED",
    entity: "User",
    entityId: user._id,
    metadata: { reason },
  });

  return user;
}

async function setStatus(
  adminId: string,
  userId: string,
  status: UserStatus,
  action: string,
  reason?: string
) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "ADMIN") {
    throw ApiError.forbidden("Admin accounts cannot be modified this way");
  }

  user.status = status;
  if (reason !== undefined) user.rejectionReason = reason;
  await user.save();

  await recordAudit({ userId: adminId, action, entity: "User", entityId: user._id, metadata: { reason } });
  return user;
}

export const blockUser = (adminId: string, userId: string) =>
  setStatus(adminId, userId, "BLOCKED", "USER_BLOCKED");

export const unblockUser = (adminId: string, userId: string) =>
  setStatus(adminId, userId, "ACTIVE", "USER_UNBLOCKED");

export const suspendUser = (adminId: string, userId: string, reason?: string) =>
  setStatus(adminId, userId, "SUSPENDED", "USER_SUSPENDED", reason);

export const reactivateUser = (adminId: string, userId: string) =>
  setStatus(adminId, userId, "ACTIVE", "USER_REACTIVATED");
