import { Announcement } from "../models/Announcement";
import { User } from "../models/User";
import { Enrollment } from "../models/Enrollment";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import { notifyUsers } from "./notification.service";
import { Role } from "../constants/enums";
import { listTrainerBatchIds, listTrainerCourseIds } from "../utils/batchAccess";
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

/** Which announcements a non-admin may read: currently live (published, not expired) and
 * addressed to them — everyone, their role, or a batch/course they belong to/teach. */
export async function visibleAnnouncementFilter(requester: { id: string; role: Role }) {
  const now = new Date();
  const live = {
    publishAt: { $lte: now },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
  };

  let batchIds: string[];
  let courseIds: string[];
  if (requester.role === "TRAINER") {
    batchIds = await listTrainerBatchIds(requester.id);
    courseIds = await listTrainerCourseIds(requester.id);
  } else {
    const enrollments = await Enrollment.find({ student: requester.id }).select("batch course").lean();
    batchIds = enrollments.map((e) => String(e.batch));
    courseIds = enrollments.map((e) => String(e.course));
  }

  return {
    $and: [
      live,
      {
        $or: [
          { audience: "EVERYONE" },
          { audience: requester.role === "TRAINER" ? "TRAINERS" : "STUDENTS" },
          { audience: "BATCH", batch: { $in: batchIds } },
          { audience: "COURSE", course: { $in: courseIds } },
        ],
      },
    ],
  };
}

export async function listAnnouncements(query: ListAnnouncementsQuery, requester: { id: string; role: Role }) {
  const filter: Record<string, unknown> =
    requester.role === "ADMIN" ? {} : await visibleAnnouncementFilter(requester);
  if (query.audience) filter.audience = query.audience;
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
