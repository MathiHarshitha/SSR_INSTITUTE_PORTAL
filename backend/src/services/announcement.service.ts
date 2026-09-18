import { Announcement } from "../models/Announcement";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
} from "../validators/announcement.validator";

export async function createAnnouncement(adminId: string, input: CreateAnnouncementInput) {
  const announcement = await Announcement.create({
    ...input,
    publishAt: input.publishAt ?? new Date(),
    createdBy: adminId,
  });

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
