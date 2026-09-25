import { searchRegex } from "../utils/searchRegex";
import { FilterQuery } from "mongoose";
import { Batch, IBatch } from "../models/Batch";
import { Enrollment } from "../models/Enrollment";
import { Course } from "../models/Course";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { assertBatchAccess } from "../utils/batchAccess";
import { recordAudit } from "./auditLog.service";
import { Role } from "../constants/enums";
import { CreateBatchInput, ListBatchesQuery, UpdateBatchInput } from "../validators/batch.validator";

async function assertCourseExists(courseId: string): Promise<void> {
  const course = await Course.findById(courseId).select("_id").lean();
  if (!course) throw ApiError.badRequest("Selected course does not exist");
}

async function assertTrainerValid(trainerId: string): Promise<void> {
  const trainer = await User.findOne({ _id: trainerId, role: "TRAINER" }).select("status").lean();
  if (!trainer) throw ApiError.badRequest("Selected trainer does not exist");
  if (trainer.status !== "ACTIVE") throw ApiError.badRequest("Selected trainer is not active");
}

function normalizeTrainer(trainer?: string): string | undefined {
  return trainer || undefined;
}

export async function createBatch(adminId: string, input: CreateBatchInput) {
  await assertCourseExists(input.course);
  const trainer = normalizeTrainer(input.trainer);
  if (trainer) await assertTrainerValid(trainer);

  const batch = await Batch.create({ ...input, trainer });

  await recordAudit({ userId: adminId, action: "BATCH_CREATED", entity: "Batch", entityId: batch._id });
  return batch;
}

async function withEnrollmentCounts(batches: IBatch[]) {
  const counts = await Enrollment.aggregate<{ _id: unknown; count: number }>([
    { $match: { batch: { $in: batches.map((b) => b._id) } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return batches.map((b) => ({ ...b, enrolledCount: countMap.get(String(b._id)) ?? 0 }));
}

export async function listBatchesAdmin(userId: string, role: Role, query: ListBatchesQuery) {
  const filter: FilterQuery<IBatch> = {};
  if (role === "TRAINER") filter.trainer = userId;
  if (query.status) filter.status = query.status;
  if (query.course) filter.course = query.course;
  if (query.search) filter.name = searchRegex(query.search);

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  const [batches, total] = await Promise.all([
    Batch.find(filter)
      .populate("course", "name")
      .populate("trainer", "name email")
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Batch.countDocuments(filter),
  ]);

  const withCounts = await withEnrollmentCounts(batches as unknown as IBatch[]);
  return { batches: withCounts, total };
}

export async function getBatchById(id: string, userId: string, role: Role) {
  await assertBatchAccess(id, userId, role);

  const batch = await Batch.findById(id)
    .populate("course", "name duration fee")
    .populate("trainer", "name email")
    .lean();
  if (!batch) throw ApiError.notFound("Batch not found");

  const [withCount] = await withEnrollmentCounts([batch as unknown as IBatch]);
  return withCount;
}

export async function updateBatch(adminId: string, id: string, input: UpdateBatchInput) {
  const batch = await Batch.findById(id);
  if (!batch) throw ApiError.notFound("Batch not found");

  if (input.course) await assertCourseExists(input.course);

  const { trainer: trainerInput, ...rest } = input;
  let trainer: string | undefined;
  if (trainerInput !== undefined) {
    trainer = normalizeTrainer(trainerInput);
    if (trainer) await assertTrainerValid(trainer);
  }

  const nextStartDate = rest.startDate ?? batch.startDate;
  const nextEndDate = rest.endDate ?? batch.endDate;
  if (nextEndDate <= nextStartDate) {
    throw ApiError.badRequest("End date must be after start date");
  }

  Object.assign(batch, rest);
  if (trainerInput !== undefined) {
    batch.set("trainer", trainer);
  }
  await batch.save();

  await recordAudit({ userId: adminId, action: "BATCH_UPDATED", entity: "Batch", entityId: batch._id });
  return batch;
}

export async function updateBatchStatus(adminId: string, id: string, status: IBatch["status"]) {
  const batch = await Batch.findById(id);
  if (!batch) throw ApiError.notFound("Batch not found");

  batch.status = status;
  await batch.save();

  await recordAudit({
    userId: adminId,
    action: "BATCH_STATUS_CHANGED",
    entity: "Batch",
    entityId: batch._id,
    metadata: { status },
  });
  return batch;
}

export async function listBatchStudents(batchId: string, userId: string, role: Role) {
  await assertBatchAccess(batchId, userId, role);

  const enrollments = await Enrollment.find({ batch: batchId })
    .populate("student", "name email phone status")
    .sort({ enrolledAt: -1 })
    .lean();

  return enrollments.map((e) => ({
    enrollmentId: e._id,
    enrolledAt: e.enrolledAt,
    student: e.student,
  }));
}

export async function enrollStudent(adminId: string, batchId: string, studentId: string) {
  const batch = await Batch.findById(batchId);
  if (!batch) throw ApiError.notFound("Batch not found");

  const student = await User.findOne({ _id: studentId, role: "STUDENT" }).select("status").lean();
  if (!student) throw ApiError.badRequest("Student not found");
  if (student.status !== "ACTIVE") throw ApiError.badRequest("Only active students can be enrolled");

  const existing = await Enrollment.findOne({ student: studentId, batch: batchId }).lean();
  if (existing) throw ApiError.conflict("Student is already enrolled in this batch");

  const currentCount = await Enrollment.countDocuments({ batch: batchId });
  if (currentCount >= batch.capacity) {
    throw ApiError.badRequest("Batch is at full capacity");
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    batch: batchId,
    course: batch.course,
  });

  await recordAudit({
    userId: adminId,
    action: "STUDENT_ENROLLED",
    entity: "Batch",
    entityId: batch._id,
    metadata: { studentId },
  });

  return enrollment;
}

export async function removeStudent(adminId: string, batchId: string, studentId: string) {
  const result = await Enrollment.findOneAndDelete({ batch: batchId, student: studentId });
  if (!result) throw ApiError.notFound("Enrollment not found");

  await recordAudit({
    userId: adminId,
    action: "STUDENT_REMOVED",
    entity: "Batch",
    entityId: batchId,
    metadata: { studentId },
  });
}
