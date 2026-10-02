import { Types } from "mongoose";
import { Course } from "../models/Course";
import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { Lesson } from "../models/Lesson";
import { Enrollment } from "../models/Enrollment";
import { listTrainerCourseIds } from "../utils/batchAccess";
import { searchRegex } from "../utils/searchRegex";
import { Role } from "../constants/enums";

const RESULT_LIMIT = 10;
/** Fetched per collection before ranking, so the best matches aren't cut off by arbitrary order. */
const CANDIDATE_LIMIT = 50;

/** Lower is better: exact name, then name starts with the query, then a word in the name starts
 * with it, then the name merely contains it, then only a description/category matched. */
function matchRank(label: string | undefined, q: string): number {
  const text = (label ?? "").toLowerCase();
  const needle = q.toLowerCase();
  if (text === needle) return 0;
  if (text.startsWith(needle)) return 1;
  if (text.split(/[^a-z0-9]+/).some((word) => word.startsWith(needle))) return 2;
  if (text.includes(needle)) return 3;
  return 4;
}

function rankAndLimit<T>(items: T[], label: (item: T) => string | undefined, q: string): T[] {
  return items
    .map((item) => ({ item, rank: matchRank(label(item), q) }))
    .sort((a, b) => a.rank - b.rank || (label(a.item) ?? "").localeCompare(label(b.item) ?? ""))
    .slice(0, RESULT_LIMIT)
    .map(({ item }) => item);
}

/** Global search across Course/Module/Topic/Lesson (spec §30), scoped per role: a student only
 * ever sees results within courses they're enrolled in, a trainer only within courses they teach,
 * an admin sees everything. Never trust the client to self-scope this.
 *
 * Matching is a case-insensitive substring match (so partial words like "clos" find
 * "Closures"). A lesson also matches when its topic or module name matches, so searching a topic
 * name lists the lessons inside it. */
export async function search(q: string, requester: { id: string; role: Role }) {
  let scopedCourseIds: Types.ObjectId[] | string[] | undefined;

  if (requester.role === "STUDENT") {
    scopedCourseIds = await Enrollment.find({ student: requester.id }).distinct("course");
  } else if (requester.role === "TRAINER") {
    scopedCourseIds = await listTrainerCourseIds(requester.id);
  }

  const regex = searchRegex(q);
  const courseScope = scopedCourseIds ? { course: { $in: scopedCourseIds } } : {};

  const [courses, modules, topics] = await Promise.all([
    Course.find({
      ...(scopedCourseIds ? { _id: { $in: scopedCourseIds } } : {}),
      $or: [{ name: regex }, { category: regex }, { shortDescription: regex }],
    })
      .select("name category")
      .limit(CANDIDATE_LIMIT)
      .lean(),
    Module.find({ ...courseScope, $or: [{ name: regex }, { description: regex }] })
      .select("name course")
      .populate("course", "name")
      .limit(CANDIDATE_LIMIT)
      .lean(),
    Topic.find({ ...courseScope, $or: [{ name: regex }, { description: regex }] })
      .select("name course module")
      .populate("course", "name")
      .populate("module", "name")
      .limit(CANDIDATE_LIMIT)
      .lean(),
  ]);

  // Only a *name* match pulls in child lessons; a description mention is too loose for that.
  const matchedModuleIds = modules.filter((m) => regex.test(m.name)).map((m) => m._id);
  const matchedTopicIds = topics.filter((t) => regex.test(t.name)).map((t) => t._id);

  const lessons = await Lesson.find({
    ...courseScope,
    published: true,
    $or: [
      { title: regex },
      { description: regex },
      { topic: { $in: matchedTopicIds } },
      { module: { $in: matchedModuleIds } },
    ],
  })
    .select("title topic module course order")
    .populate("course", "name")
    .populate("module", "name")
    .populate("topic", "name")
    .limit(CANDIDATE_LIMIT)
    .lean();

  return {
    courses: rankAndLimit(courses, (c) => c.name, q),
    modules: rankAndLimit(modules, (m) => m.name, q),
    topics: rankAndLimit(topics, (t) => t.name, q),
    lessons: rankAndLimit(lessons, (l) => l.title, q),
  };
}
