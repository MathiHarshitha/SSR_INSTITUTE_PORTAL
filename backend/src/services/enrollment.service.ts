import { Types } from "mongoose";
import { Enrollment } from "../models/Enrollment";
import { Lesson } from "../models/Lesson";
import { ApiError } from "../utils/ApiError";
import { getCourseProgress } from "./progress.service";

/** Every course a student is enrolled in, each augmented with its own live progress —
 * powers the multi-course "My Courses" dashboard (spec §7/§8). */
export async function listMyEnrollments(studentId: string) {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate("course", "name shortDescription category duration thumbnailUrl")
    .populate("lastVisitedLesson", "title")
    .sort({ enrolledAt: -1 })
    .lean();

  return Promise.all(
    enrollments.map(async (e) => {
      const courseId = String((e.course as unknown as { _id: Types.ObjectId })._id);
      const progress = await getCourseProgress(studentId, courseId);
      return {
        enrollmentId: e._id,
        course: e.course,
        enrolledAt: e.enrolledAt,
        lastVisitedLesson: e.lastVisitedLesson,
        lastVisitedAt: e.lastVisitedAt,
        overallProgress: progress.overallProgress,
        totalLessons: progress.totalLessons,
        totalCompleted: progress.totalCompleted,
      };
    })
  );
}

/** Fired (non-blocking) when a student opens a lesson — powers "Continue where you left off". */
export async function updateLastVisited(studentId: string, courseId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).select("course").lean();
  if (!lesson || String(lesson.course) !== courseId) {
    throw ApiError.badRequest("Lesson does not belong to this course");
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { $set: { lastVisitedLesson: lessonId, lastVisitedAt: new Date() } },
    { new: true }
  );
  if (!enrollment) throw ApiError.forbidden("You are not enrolled in this course");
  return enrollment;
}
