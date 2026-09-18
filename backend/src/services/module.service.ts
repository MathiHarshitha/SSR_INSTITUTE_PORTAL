import { Module } from "../models/Module";
import { Lesson } from "../models/Lesson";
import { Course } from "../models/Course";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "../validators/module.validator";

async function assertCourseExists(courseId: string): Promise<void> {
  const course = await Course.findById(courseId).select("_id").lean();
  if (!course) throw ApiError.notFound("Course not found");
}

export async function listModules(courseId: string) {
  await assertCourseExists(courseId);
  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();

  const lessonCounts = await Lesson.aggregate<{ _id: unknown; count: number }>([
    { $match: { module: { $in: modules.map((m) => m._id) } } },
    { $group: { _id: "$module", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(lessonCounts.map((c) => [String(c._id), c.count]));

  return modules.map((m) => ({ ...m, lessonCount: countMap.get(String(m._id)) ?? 0 }));
}

export async function createModule(adminId: string, courseId: string, input: CreateModuleInput) {
  await assertCourseExists(courseId);
  const maxOrder = await Module.findOne({ course: courseId }).sort({ order: -1 }).select("order").lean();

  const module = await Module.create({
    ...input,
    course: courseId,
    order: (maxOrder?.order ?? -1) + 1,
  });

  await recordAudit({ userId: adminId, action: "MODULE_CREATED", entity: "Module", entityId: module._id });
  return module;
}

export async function updateModule(adminId: string, id: string, input: UpdateModuleInput) {
  const module = await Module.findById(id);
  if (!module) throw ApiError.notFound("Module not found");

  Object.assign(module, input);
  await module.save();

  await recordAudit({ userId: adminId, action: "MODULE_UPDATED", entity: "Module", entityId: module._id });
  return module;
}

export async function deleteModule(adminId: string, id: string) {
  const module = await Module.findById(id);
  if (!module) throw ApiError.notFound("Module not found");

  await Lesson.deleteMany({ module: id });
  await module.deleteOne();

  await recordAudit({ userId: adminId, action: "MODULE_DELETED", entity: "Module", entityId: id });
}

export async function reorderModules(adminId: string, courseId: string, orderedIds: string[]) {
  await assertCourseExists(courseId);

  await Promise.all(
    orderedIds.map((id, index) =>
      Module.updateOne({ _id: id, course: courseId }, { $set: { order: index } })
    )
  );

  await recordAudit({
    userId: adminId,
    action: "MODULES_REORDERED",
    entity: "Course",
    entityId: courseId,
  });
}

async function assertModuleExists(moduleId: string) {
  const module = await Module.findById(moduleId).select("_id course").lean();
  if (!module) throw ApiError.notFound("Module not found");
  return module;
}

export async function listLessons(moduleId: string) {
  await assertModuleExists(moduleId);
  return Lesson.find({ module: moduleId }).sort({ order: 1 }).lean();
}

export async function createLesson(adminId: string, moduleId: string, input: CreateLessonInput) {
  const module = await assertModuleExists(moduleId);
  const maxOrder = await Lesson.findOne({ module: moduleId }).sort({ order: -1 }).select("order").lean();

  const lesson = await Lesson.create({
    ...input,
    module: moduleId,
    course: module.course,
    order: (maxOrder?.order ?? -1) + 1,
  });

  await recordAudit({ userId: adminId, action: "LESSON_CREATED", entity: "Lesson", entityId: lesson._id });
  return lesson;
}

export async function updateLesson(adminId: string, id: string, input: UpdateLessonInput) {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw ApiError.notFound("Lesson not found");

  Object.assign(lesson, input);
  await lesson.save();

  await recordAudit({ userId: adminId, action: "LESSON_UPDATED", entity: "Lesson", entityId: lesson._id });
  return lesson;
}

export async function deleteLesson(adminId: string, id: string) {
  const lesson = await Lesson.findByIdAndDelete(id);
  if (!lesson) throw ApiError.notFound("Lesson not found");

  await recordAudit({ userId: adminId, action: "LESSON_DELETED", entity: "Lesson", entityId: id });
}

export async function reorderLessons(adminId: string, moduleId: string, orderedIds: string[]) {
  await assertModuleExists(moduleId);

  await Promise.all(
    orderedIds.map((id, index) =>
      Lesson.updateOne({ _id: id, module: moduleId }, { $set: { order: index } })
    )
  );

  await recordAudit({
    userId: adminId,
    action: "LESSONS_REORDERED",
    entity: "Module",
    entityId: moduleId,
  });
}
