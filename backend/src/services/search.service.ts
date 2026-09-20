import { Types } from "mongoose";
import { Course } from "../models/Course";
import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { Lesson } from "../models/Lesson";
import { Enrollment } from "../models/Enrollment";
import { listTrainerCourseIds } from "../utils/batchAccess";
import { Role } from "../constants/enums";

/** Global search across Course/Module/Lesson (spec §30), scoped per role: a student only ever
 * sees results within courses they're enrolled in, a trainer only within courses they teach,
 * an admin sees everything. Never trust the client to self-scope this. */
export async function search(q: string, requester: { id: string; role: Role }) {
  let scopedCourseIds: Types.ObjectId[] | string[] | undefined;

  if (requester.role === "STUDENT") {
    scopedCourseIds = await Enrollment.find({ student: requester.id }).distinct("course");
  } else if (requester.role === "TRAINER") {
    scopedCourseIds = await listTrainerCourseIds(requester.id);
  }

  const courseFilter: Record<string, unknown> = { $text: { $search: q } };
  if (scopedCourseIds) courseFilter._id = { $in: scopedCourseIds };

  const moduleFilter: Record<string, unknown> = { $text: { $search: q } };
  if (scopedCourseIds) moduleFilter.course = { $in: scopedCourseIds };

  const topicFilter: Record<string, unknown> = { $text: { $search: q } };
  if (scopedCourseIds) topicFilter.course = { $in: scopedCourseIds };

  const lessonFilter: Record<string, unknown> = { $text: { $search: q }, published: true };
  if (scopedCourseIds) lessonFilter.course = { $in: scopedCourseIds };

  const [courses, modules, topics, lessons] = await Promise.all([
    Course.find(courseFilter).select("name category").limit(10).lean(),
    Module.find(moduleFilter).select("name course").populate("course", "name").limit(10).lean(),
    Topic.find(topicFilter)
      .select("name course module")
      .populate("course", "name")
      .populate("module", "name")
      .limit(10)
      .lean(),
    Lesson.find(lessonFilter)
      .select("title topic module course")
      .populate("course", "name")
      .populate("module", "name")
      .populate("topic", "name")
      .limit(10)
      .lean(),
  ]);

  return { courses, modules, topics, lessons };
}
