import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { Lesson, ILesson } from "../models/Lesson";
import { LessonProgress } from "../models/LessonProgress";
import { FinalAssessmentAttempt } from "../models/FinalAssessmentAttempt";
import { FinalAssessment } from "../models/FinalAssessment";
import { ApiError } from "./ApiError";
import { assertStudentEnrolledInCourse } from "./batchAccess";
import { buildCourseProgressTree, CourseProgressTree, LessonNode } from "./progressState";

/** Loads course structure + this student's progress rows and builds the full lock-state tree.
 * The single call every gating check in the app funnels through. */
export async function loadCourseProgressTree(
  studentId: string,
  courseId: string
): Promise<CourseProgressTree> {
  const [modules, topics, lessons, progressRows] = await Promise.all([
    Module.find({ course: courseId }).select("_id order").lean(),
    Topic.find({ course: courseId }).select("_id module order").lean(),
    Lesson.find({ course: courseId })
      .select("_id topic module order practice quiz codingQuestion")
      .lean(),
    LessonProgress.find({ student: studentId, course: courseId })
      .select("lesson practiceCompleted quizPassed codingCompleted completed quizAttempts")
      .lean(),
  ]);

  return buildCourseProgressTree(modules, topics, lessons, progressRows);
}

/** Enrollment + lock-state check: throws 403 if the student isn't enrolled, or if this
 * lesson hasn't been reached yet in the sequential order. Completed/unlocked/in-progress
 * lessons are all accessible (completed lessons stay open for revision). */
export async function assertLessonUnlocked(studentId: string, lesson: ILesson): Promise<LessonNode> {
  const courseId = String(lesson.course);
  await assertStudentEnrolledInCourse(courseId, studentId);

  const tree = await loadCourseProgressTree(studentId, courseId);
  const node = tree.lessons.get(String(lesson._id));
  if (!node) throw ApiError.notFound("Lesson not found in this course's curriculum");
  if (node.state === "LOCKED") {
    throw ApiError.forbidden("Complete the previous lesson before accessing this one");
  }
  return node;
}

/** Whole-course completion (spec §9): every module/topic/lesson complete, and — if the
 * course has a published final assessment — that attempt must be SUBMITTED too. */
export async function isCourseCompleted(studentId: string, courseId: string): Promise<boolean> {
  const tree = await loadCourseProgressTree(studentId, courseId);
  if (!tree.allModulesCompleted) return false;

  const finalAssessment = await FinalAssessment.findOne({ course: courseId, published: true })
    .select("_id")
    .lean();
  if (!finalAssessment) return true;

  const attempt = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId })
    .select("status")
    .lean();
  return attempt?.status === "SUBMITTED";
}

/** Backend-enforced gate for certificate issuance and career-resource access (spec §11/§12).
 * Never trust a client-sent "completed" flag — this always re-derives from stored progress. */
export async function assertCourseCompletedForUnlock(
  studentId: string,
  courseId: string,
  resourceLabel: string
): Promise<void> {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const completed = await isCourseCompleted(studentId, courseId);
  if (!completed) {
    throw ApiError.forbidden(`Complete the course to unlock ${resourceLabel}`);
  }
}
