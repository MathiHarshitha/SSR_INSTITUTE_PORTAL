import { Notification, NotificationType } from "../models/Notification";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

interface NotifyInput {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function notifyUser(userId: string, input: NotifyInput) {
  await Notification.create({ user: userId, ...input });
}

export async function notifyUsers(userIds: string[], input: NotifyInput): Promise<void> {
  if (userIds.length === 0) return;
  await Notification.insertMany(userIds.map((user) => ({ user, ...input })));
}

export async function notifyActiveAdmins(input: NotifyInput): Promise<void> {
  const admins = await User.find({ role: "ADMIN", status: "ACTIVE" }).select("_id").lean();
  await notifyUsers(
    admins.map((a) => String(a._id)),
    input
  );
}

/** For notifications that are a side effect: a failure is logged, never surfaced, so it can't
 * fail the action that triggered it (a submission, a verification, ...). */
export async function notifySafely(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    logger.error("Failed to create notification", error);
  }
}

export async function listMyNotifications(
  userId: string,
  query: { page: number; limit: number }
) {
  const skip = (query.page - 1) * query.limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Notification.countDocuments({ user: userId }),
  ]);

  return { notifications, total };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, read: false });
}

export async function markAsRead(userId: string, id: string) {
  const notification = await Notification.findOne({ _id: id, user: userId });
  if (!notification) throw ApiError.notFound("Notification not found");

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { user: userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
}
