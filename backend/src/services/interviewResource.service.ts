import { InterviewResource } from "../models/InterviewResource";
import { ApiError } from "../utils/ApiError";
import { assertCourseCompletedForUnlock } from "../utils/lessonAccess";
import { Enrollment } from "../models/Enrollment";
import {
  CreateInterviewResourceInput,
  UpdateInterviewResourceInput,
} from "../validators/interviewResource.validator";

export async function createInterviewResource(adminId: string, input: CreateInterviewResourceInput) {
  return InterviewResource.create({ ...input, createdBy: adminId });
}

export async function updateInterviewResource(id: string, input: UpdateInterviewResourceInput) {
  const resource = await InterviewResource.findById(id);
  if (!resource) throw ApiError.notFound("Interview resource not found");
  Object.assign(resource, input);
  await resource.save();
  return resource;
}

export async function deleteInterviewResource(id: string) {
  const resource = await InterviewResource.findByIdAndDelete(id);
  if (!resource) throw ApiError.notFound("Interview resource not found");
}

export async function listInterviewResourcesAdmin() {
  return InterviewResource.find().sort({ createdAt: -1 }).lean();
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
