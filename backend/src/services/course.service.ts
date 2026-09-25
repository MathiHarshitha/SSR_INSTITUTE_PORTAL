import { searchRegex } from "../utils/searchRegex";
import { FilterQuery } from "mongoose";
import { Course, ICourse } from "../models/Course";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import { assertCourseContentAccess, listTrainerCourseIds } from "../utils/batchAccess";
import { Role } from "../constants/enums";
import { CreateCourseInput, ListCoursesQuery, UpdateCourseInput } from "../validators/course.validator";

/** Public listing used by the student registration form's course picker. No auth required. */
export async function listPublishedCourses() {
  return Course.find({ status: "PUBLISHED" })
    .select("name shortDescription category duration fee")
    .sort({ name: 1 })
    .lean();
}

export async function listCoursesAdmin(query: ListCoursesQuery) {
  const filter: FilterQuery<ICourse> = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = searchRegex(query.search);
    filter.$or = [{ name: regex }, { category: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  const [courses, total] = await Promise.all([
    Course.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Course.countDocuments(filter),
  ]);

  return { courses, total };
}

/** A trainer's "My Courses" — every course they're assigned to teach via at least one batch. */
export async function listCoursesForTrainer(trainerId: string) {
  const courseIds = await listTrainerCourseIds(trainerId);
  return Course.find({ _id: { $in: courseIds } })
    .select("name shortDescription category duration status")
    .sort({ name: 1 })
    .lean();
}

export async function getCourseById(id: string, requester: { id: string; role: Role }) {
  const course = await Course.findById(id).lean();
  if (!course) throw ApiError.notFound("Course not found");
  if (requester.role === "TRAINER") await assertCourseContentAccess(id, requester);
  return course;
}

export async function createCourse(adminId: string, input: CreateCourseInput) {
  const course = await Course.create({
    ...input,
    thumbnailUrl: input.thumbnailUrl || undefined,
  });

  await recordAudit({
    userId: adminId,
    action: "COURSE_CREATED",
    entity: "Course",
    entityId: course._id,
  });

  return course;
}

export async function updateCourse(adminId: string, id: string, input: UpdateCourseInput) {
  const course = await Course.findById(id);
  if (!course) throw ApiError.notFound("Course not found");

  Object.assign(course, input);
  if (input.thumbnailUrl !== undefined) {
    course.thumbnailUrl = input.thumbnailUrl || undefined;
  }
  await course.save();

  await recordAudit({
    userId: adminId,
    action: "COURSE_UPDATED",
    entity: "Course",
    entityId: course._id,
  });

  return course;
}

export async function updateCourseStatus(
  adminId: string,
  id: string,
  status: ICourse["status"]
) {
  const course = await Course.findById(id);
  if (!course) throw ApiError.notFound("Course not found");

  course.status = status;
  await course.save();

  await recordAudit({
    userId: adminId,
    action: "COURSE_STATUS_CHANGED",
    entity: "Course",
    entityId: course._id,
    metadata: { status },
  });

  return course;
}
