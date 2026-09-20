import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { Lesson } from "../models/Lesson";
import { Course } from "../models/Course";
import { LessonProgress } from "../models/LessonProgress";
import { ApiError } from "../utils/ApiError";
import { assertCourseContentAccess } from "../utils/batchAccess";
import { Role } from "../constants/enums";
import { recordAudit } from "./auditLog.service";
import {
  CreateLessonInput,
  CreateModuleInput,
  CreateTopicInput,
  UpdateLessonInput,
  UpdateModuleInput,
  UpdateTopicInput,
} from "../validators/module.validator";

export interface Requester {
  id: string;
  role: Role;
}

async function assertCourseExists(courseId: string): Promise<void> {
  const course = await Course.findById(courseId).select("_id").lean();
  if (!course) throw ApiError.notFound("Course not found");
}

export async function listModules(requester: Requester, courseId: string) {
  await assertCourseExists(courseId);
  await assertCourseContentAccess(courseId, requester);
  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();

  const lessonCounts = await Lesson.aggregate<{ _id: unknown; count: number }>([
    { $match: { module: { $in: modules.map((m) => m._id) } } },
    { $group: { _id: "$module", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(lessonCounts.map((c) => [String(c._id), c.count]));

  return modules.map((m) => ({ ...m, lessonCount: countMap.get(String(m._id)) ?? 0 }));
}

export async function createModule(requester: Requester, courseId: string, input: CreateModuleInput) {
  await assertCourseExists(courseId);
  await assertCourseContentAccess(courseId, requester);
  const maxOrder = await Module.findOne({ course: courseId }).sort({ order: -1 }).select("order").lean();

  const module = await Module.create({
    ...input,
    course: courseId,
    order: (maxOrder?.order ?? -1) + 1,
  });

  await recordAudit({ userId: requester.id, action: "MODULE_CREATED", entity: "Module", entityId: module._id });
  return module;
}

export async function updateModule(requester: Requester, id: string, input: UpdateModuleInput) {
  const module = await Module.findById(id);
  if (!module) throw ApiError.notFound("Module not found");
  await assertCourseContentAccess(String(module.course), requester);

  Object.assign(module, input);
  await module.save();

  await recordAudit({ userId: requester.id, action: "MODULE_UPDATED", entity: "Module", entityId: module._id });
  return module;
}

export async function deleteModule(requester: Requester, id: string) {
  const module = await Module.findById(id);
  if (!module) throw ApiError.notFound("Module not found");
  await assertCourseContentAccess(String(module.course), requester);

  const lessonIds = await Lesson.find({ module: id }).distinct("_id");
  await LessonProgress.deleteMany({ lesson: { $in: lessonIds } });
  await Lesson.deleteMany({ module: id });
  await Topic.deleteMany({ module: id });
  await module.deleteOne();

  await recordAudit({ userId: requester.id, action: "MODULE_DELETED", entity: "Module", entityId: id });
}

export async function reorderModules(requester: Requester, courseId: string, orderedIds: string[]) {
  await assertCourseExists(courseId);
  await assertCourseContentAccess(courseId, requester);

  await Promise.all(
    orderedIds.map((id, index) =>
      Module.updateOne({ _id: id, course: courseId }, { $set: { order: index } })
    )
  );

  await recordAudit({
    userId: requester.id,
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

export async function listTopics(requester: Requester, moduleId: string) {
  const module = await assertModuleExists(moduleId);
  await assertCourseContentAccess(String(module.course), requester);
  const topics = await Topic.find({ module: moduleId }).sort({ order: 1 }).lean();

  const lessonCounts = await Lesson.aggregate<{ _id: unknown; count: number }>([
    { $match: { topic: { $in: topics.map((t) => t._id) } } },
    { $group: { _id: "$topic", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(lessonCounts.map((c) => [String(c._id), c.count]));

  return topics.map((t) => ({ ...t, lessonCount: countMap.get(String(t._id)) ?? 0 }));
}

export async function createTopic(requester: Requester, moduleId: string, input: CreateTopicInput) {
  const module = await assertModuleExists(moduleId);
  await assertCourseContentAccess(String(module.course), requester);
  const maxOrder = await Topic.findOne({ module: moduleId }).sort({ order: -1 }).select("order").lean();

  const topic = await Topic.create({
    ...input,
    module: moduleId,
    course: module.course,
    order: (maxOrder?.order ?? -1) + 1,
  });

  await recordAudit({ userId: requester.id, action: "TOPIC_CREATED", entity: "Topic", entityId: topic._id });
  return topic;
}

export async function updateTopic(requester: Requester, id: string, input: UpdateTopicInput) {
  const topic = await Topic.findById(id);
  if (!topic) throw ApiError.notFound("Topic not found");
  await assertCourseContentAccess(String(topic.course), requester);

  Object.assign(topic, input);
  await topic.save();

  await recordAudit({ userId: requester.id, action: "TOPIC_UPDATED", entity: "Topic", entityId: topic._id });
  return topic;
}

export async function deleteTopic(requester: Requester, id: string) {
  const topic = await Topic.findById(id);
  if (!topic) throw ApiError.notFound("Topic not found");
  await assertCourseContentAccess(String(topic.course), requester);

  const lessonIds = await Lesson.find({ topic: id }).distinct("_id");
  await LessonProgress.deleteMany({ lesson: { $in: lessonIds } });
  await Lesson.deleteMany({ topic: id });
  await topic.deleteOne();

  await recordAudit({ userId: requester.id, action: "TOPIC_DELETED", entity: "Topic", entityId: id });
}

export async function reorderTopics(requester: Requester, moduleId: string, orderedIds: string[]) {
  const module = await assertModuleExists(moduleId);
  await assertCourseContentAccess(String(module.course), requester);

  await Promise.all(
    orderedIds.map((id, index) =>
      Topic.updateOne({ _id: id, module: moduleId }, { $set: { order: index } })
    )
  );

  await recordAudit({
    userId: requester.id,
    action: "TOPICS_REORDERED",
    entity: "Module",
    entityId: moduleId,
  });
}

async function assertTopicExists(topicId: string) {
  const topic = await Topic.findById(topicId).select("_id course module").lean();
  if (!topic) throw ApiError.notFound("Topic not found");
  return topic;
}

export async function listLessons(requester: Requester, topicId: string) {
  const topic = await assertTopicExists(topicId);
  await assertCourseContentAccess(String(topic.course), requester);
  return Lesson.find({ topic: topicId }).sort({ order: 1 }).lean();
}

export async function getLessonForAuthoring(requester: Requester, id: string) {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertCourseContentAccess(String(lesson.course), requester);
  return lesson;
}

export async function createLesson(requester: Requester, topicId: string, input: CreateLessonInput) {
  const topic = await assertTopicExists(topicId);
  await assertCourseContentAccess(String(topic.course), requester);
  const maxOrder = await Lesson.findOne({ topic: topicId }).sort({ order: -1 }).select("order").lean();

  const lesson = await Lesson.create({
    ...input,
    topic: topicId,
    module: topic.module,
    course: topic.course,
    order: (maxOrder?.order ?? -1) + 1,
  });

  await recordAudit({ userId: requester.id, action: "LESSON_CREATED", entity: "Lesson", entityId: lesson._id });
  return lesson;
}

export async function updateLesson(requester: Requester, id: string, input: UpdateLessonInput) {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertCourseContentAccess(String(lesson.course), requester);

  Object.assign(lesson, input);
  await lesson.save();

  await recordAudit({ userId: requester.id, action: "LESSON_UPDATED", entity: "Lesson", entityId: lesson._id });
  return lesson;
}

export async function deleteLesson(requester: Requester, id: string) {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertCourseContentAccess(String(lesson.course), requester);

  await LessonProgress.deleteMany({ lesson: id });
  await lesson.deleteOne();

  await recordAudit({ userId: requester.id, action: "LESSON_DELETED", entity: "Lesson", entityId: id });
}

export async function reorderLessons(requester: Requester, topicId: string, orderedIds: string[]) {
  const topic = await assertTopicExists(topicId);
  await assertCourseContentAccess(String(topic.course), requester);

  await Promise.all(
    orderedIds.map((id, index) =>
      Lesson.updateOne({ _id: id, topic: topicId }, { $set: { order: index } })
    )
  );

  await recordAudit({
    userId: requester.id,
    action: "LESSONS_REORDERED",
    entity: "Topic",
    entityId: topicId,
  });
}
