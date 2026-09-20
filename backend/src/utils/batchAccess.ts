import { Batch, IBatch } from "../models/Batch";
import { Enrollment } from "../models/Enrollment";
import { ApiError } from "../utils/ApiError";
import { Role } from "../constants/enums";

/**
 * Enforces spec §60 rules #6/#9: trainers can only access their own assigned
 * batches, students can only access batches they're enrolled in; admins can
 * access any batch. Never trust a role/id sent by the client alone — this
 * re-fetches the batch and checks it against stored trainer/enrollment data.
 */
export async function assertBatchAccess(
  batchId: string,
  userId: string,
  role: Role
): Promise<IBatch> {
  const batch = await Batch.findById(batchId);
  if (!batch) throw ApiError.notFound("Batch not found");

  if (role === "ADMIN") return batch;

  if (role === "TRAINER" && batch.trainer && String(batch.trainer) === userId) {
    return batch;
  }

  if (role === "STUDENT") {
    const enrolled = await Enrollment.findOne({ student: userId, batch: batchId }).select("_id").lean();
    if (enrolled) return batch;
  }

  throw ApiError.forbidden("You do not have access to this batch");
}

export async function listTrainerBatchIds(trainerId: string): Promise<string[]> {
  const batches = await Batch.find({ trainer: trainerId }).select("_id").lean();
  return batches.map((b) => String(b._id));
}

export async function listStudentBatchIds(studentId: string): Promise<string[]> {
  const enrollments = await Enrollment.find({ student: studentId }).select("batch").lean();
  return enrollments.map((e) => String(e.batch));
}

/**
 * Curriculum-authoring access: an admin may edit any course's content; a trainer
 * may edit a course's content only if assigned as trainer on at least one batch of
 * that course (reuses the existing Batch.trainer assignment rather than a new
 * course<->trainer join table). Re-fetches from the DB, never trusts the client.
 */
export async function assertCourseContentAccess(
  courseId: string,
  requester: { id: string; role: Role }
): Promise<void> {
  if (requester.role === "ADMIN") return;

  if (requester.role === "TRAINER") {
    const assigned = await Batch.exists({ course: courseId, trainer: requester.id });
    if (assigned) return;
  }

  throw ApiError.forbidden("You are not assigned to this course");
}

export async function listTrainerCourseIds(trainerId: string): Promise<string[]> {
  const courseIds = await Batch.find({ trainer: trainerId }).distinct("course");
  return courseIds.map((id) => String(id));
}

/** A student may only read curriculum content for a course they're enrolled in. */
export async function assertStudentEnrolledInCourse(courseId: string, studentId: string): Promise<void> {
  const enrolled = await Enrollment.findOne({ student: studentId, course: courseId }).select("_id").lean();
  if (!enrolled) throw ApiError.forbidden("You are not enrolled in this course");
}
