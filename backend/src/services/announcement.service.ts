import { Announcement } from "../models/Announcement";
import { User } from "../models/User";
import { Enrollment } from "../models/Enrollment";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import { notifyUsers } from "./notification.service";
import {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
} from "../validators/announcement.validator";

async function resolveAudienceUserIds(
  audience: CreateAnnouncementInput["audience"],
  batch?: string,
  course?: string
): Promise<string[]> {
  switch (audience) {
    case "EVERYONE":
      return (await User.find({ status: "ACTIVE" }).select("_id").lean()).map((u) => String(u._id));
    case "STUDENTS":
      return (await User.find({ status: "ACTIVE", role: "STUDENT" }).select("_id").lean()).map((u) =>
        String(u._id)
      );
    case "TRAINERS":
      return (await User.find({ status: "ACTIVE", role: "TRAINER" }).select("_id").lean()).map((u) =>
        String(u._id)
      );
    case "BATCH":
      return (await Enrollment.find({ batch }).select("student").lean()).map((e) => String(e.student));
    case "COURSE":
      return (await Enrollment.find({ course }).select("student").lean()).map((e) => String(e.student));
  }
}

export async function createAnnouncement(adminId: string, input: CreateAnnouncementInput) {
  const publishAt = input.publishAt ?? new Date();

  const announcement = await Announcement.create({
    ...input,
    publishAt,
    createdBy: adminId,
  });

  if (publishAt <= new Date()) {
    const recipientIds = await resolveAudienceUserIds(input.audience, input.batch, input.course);
    await notifyUsers(recipientIds, {
      type: "ANNOUNCEMENT",
      title: announcement.title,
      message: announcement.content,
    });
  }

  await recordAudit({
    userId: adminId,
    action: "ANNOUNCEMENT_CREATED",
    entity: "Announcement",
    entityId: announcement._id,
  });

  return announcement;
}

export async function listAnnouncements(query: ListAnnouncementsQuery) {
  const filter = query.audience ? { audience: query.audience } : {};
  const skip = (query.page - 1) * query.limit;

  const [announcements, total] = await Promise.all([
    Announcement.find(filter)
      .populate("batch", "name")
      .populate("course", "name")
      .populate("createdBy", "name")
      .sort({ publishAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Announcement.countDocuments(filter),
  ]);

  return { announcements, total };
}

export async function deleteAnnouncement(adminId: string, id: string) {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) throw ApiError.notFound("Announcement not found");

  await recordAudit({
    userId: adminId,
    action: "ANNOUNCEMENT_DELETED",
    entity: "Announcement",
    entityId: id,
  });
}
