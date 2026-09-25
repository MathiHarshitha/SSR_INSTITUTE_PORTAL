import { InterviewResource } from "../models/InterviewResource";
import { ApiError } from "../utils/ApiError";
import { assertCourseCompletedForUnlock } from "../utils/lessonAccess";
import { Enrollment } from "../models/Enrollment";
import { assertCourseContentAccess, listTrainerCourseIds } from "../utils/batchAccess";
import { Role } from "../constants/enums";
import { recordAudit } from "./auditLog.service";
import {
  CreateInterviewResourceInput,
  UpdateInterviewResourceInput,
} from "../validators/interviewResource.validator";

interface Requester {
  id: string;
  role: Role;
}

// Admins manage every course's resources; a trainer only those of courses they teach
// (same assignment rule as curriculum authoring), re-checked against the DB on every write.

export async function createInterviewResource(requester: Requester, input: CreateInterviewResourceInput) {
  await assertCourseContentAccess(input.course, requester);
  const resource = await InterviewResource.create({ ...input, createdBy: requester.id });
  await recordAudit({ userId: requester.id, action: "INTERVIEW_RESOURCE_CREATED", entity: "InterviewResource", entityId: resource._id });
  return resource;
}

export async function updateInterviewResource(
  requester: Requester,
  id: string,
  input: UpdateInterviewResourceInput
) {
  const resource = await InterviewResource.findById(id);
  if (!resource) throw ApiError.notFound("Interview resource not found");
  await assertCourseContentAccess(String(resource.course), requester);
  // Moving a resource to another course requires access to that course too.
  if (input.course && input.course !== String(resource.course)) {
    await assertCourseContentAccess(input.course, requester);
  }
  Object.assign(resource, input);
  await resource.save();
  await recordAudit({ userId: requester.id, action: "INTERVIEW_RESOURCE_UPDATED", entity: "InterviewResource", entityId: resource._id });
  return resource;
}

export async function deleteInterviewResource(requester: Requester, id: string) {
  const resource = await InterviewResource.findById(id);
  if (!resource) throw ApiError.notFound("Interview resource not found");
  await assertCourseContentAccess(String(resource.course), requester);
  await resource.deleteOne();
  await recordAudit({ userId: requester.id, action: "INTERVIEW_RESOURCE_DELETED", entity: "InterviewResource", entityId: id });
}

export async function listInterviewResourcesAdmin(requester: Requester) {
  const filter = requester.role === "TRAINER" ? { course: { $in: await listTrainerCourseIds(requester.id) } } : {};
  return InterviewResource.find(filter).sort({ createdAt: -1 }).lean();
}

/** Student-facing list — gated on having completed the course each resource belongs to
 * (spec §12: locked until the whole course is complete). Resources for a not-yet-completed
 * course are omitted rather than shown-but-disabled, so nothing about their content leaks. */
export async function listInterviewResourcesForStudent(studentId: string) {
  const enrollments = await Enrollment.find({ student: studentId }).select("course").lean();
  const enrolledCourseIds = enrollments.map((e) => String(e.course));

  const unlockedCourseIds: string[] = [];
  for (const courseId of enrolledCourseIds) {
    try {
      await assertCourseCompletedForUnlock(studentId, courseId, "Interview Resources");
      unlockedCourseIds.push(courseId);
    } catch {
      // not yet unlocked for this course — skip
    }
  }

  if (unlockedCourseIds.length === 0) return [];

  return InterviewResource.find({ course: { $in: unlockedCourseIds } })
    .sort({ createdAt: -1 })
    .lean();
}
