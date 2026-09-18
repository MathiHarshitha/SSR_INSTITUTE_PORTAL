import { Lesson } from "../models/Lesson";
import { Module } from "../models/Module";
import { LessonProgress } from "../models/LessonProgress";
import { Enrollment } from "../models/Enrollment";
import { ApiError } from "../utils/ApiError";

async function assertEnrolledInLessonsCourse(studentId: string, courseId: string): Promise<void> {
  const enrolled = await Enrollment.findOne({ student: studentId, course: courseId }).select("_id").lean();
  if (!enrolled) throw ApiError.forbidden("You are not enrolled in this course");
}

export async function markLessonComplete(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");

  await assertEnrolledInLessonsCourse(studentId, String(lesson.course));

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { $setOnInsert: { module: lesson.module, course: lesson.course, completedAt: new Date() } },
    { upsert: true }
  );
}

export async function unmarkLessonComplete(studentId: string, lessonId: string) {
  await LessonProgress.deleteOne({ student: studentId, lesson: lessonId });
}

export async function getCourseProgress(studentId: string, courseId: string) {
  await assertEnrolledInLessonsCourse(studentId, courseId);

  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();
  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();
  const completed = await LessonProgress.find({ student: studentId, course: courseId })
    .select("lesson")
    .lean();
  const completedIds = new Set(completed.map((c) => String(c.lesson)));

  const lessonsByModule = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = String(lesson.module);
    if (!lessonsByModule.has(key)) lessonsByModule.set(key, []);
    lessonsByModule.get(key)!.push(lesson);
  }

  const moduleProgress = modules.map((mod) => {
    const moduleLessons = lessonsByModule.get(String(mod._id)) ?? [];
    const completedCount = moduleLessons.filter((l) => completedIds.has(String(l._id))).length;
    const progress =
      moduleLessons.length > 0 ? Math.round((completedCount / moduleLessons.length) * 100) : 0;

    return {
      moduleId: mod._id,
      name: mod.name,
      order: mod.order,
      totalLessons: moduleLessons.length,
      completedLessons: completedCount,
      progress,
      lessons: moduleLessons.map((l) => ({
        lessonId: l._id,
        title: l.title,
        estimatedMinutes: l.estimatedMinutes,
        completed: completedIds.has(String(l._id)),
      })),
    };
  });

  const totalLessons = lessons.length;
  const totalCompleted = completed.length;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return { courseId, overallProgress, totalLessons, totalCompleted, modules: moduleProgress };
}
