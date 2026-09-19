import { Notification, NotificationType } from "../models/Notification";
import { ApiError } from "../utils/ApiError";

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
