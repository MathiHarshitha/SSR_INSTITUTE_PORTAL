import { Lesson } from "../models/Lesson";
import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { LessonProgress } from "../models/LessonProgress";
import { ApiError } from "../utils/ApiError";
import { assertCourseContentAccess, assertStudentEnrolledInCourse } from "../utils/batchAccess";
import { Role } from "../constants/enums";

/** Full lesson content for a student, with quiz answers stripped so they can't be read before submitting. */
export async function getLessonForStudent(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson || !lesson.published) throw ApiError.notFound("Lesson not found");

  await assertStudentEnrolledInCourse(String(lesson.course), studentId);

  const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId })
    .select("completed quizBestScore quizAttempts")
    .lean();

  return {
    ...lesson,
    quiz: lesson.quiz.map((q) => ({ question: q.question, options: q.options })),
    completed: progress?.completed ?? false,
    quizBestScore: progress?.quizBestScore,
    quizAttempts: progress?.quizAttempts ?? 0,
  };
}

export async function markLessonComplete(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");

  await assertStudentEnrolledInCourse(String(lesson.course), studentId);

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: { completed: true, completedAt: new Date() },
      $setOnInsert: { topic: lesson.topic, module: lesson.module, course: lesson.course },
    },
    { upsert: true }
  );
}

export async function unmarkLessonComplete(studentId: string, lessonId: string) {
  await LessonProgress.updateOne(
    { student: studentId, lesson: lessonId },
    { $set: { completed: false }, $unset: { completedAt: 1 } }
  );
}

/** Grades a quiz attempt server-side and records the student's best score. Never trusts a client-sent score. */
export async function submitLessonQuiz(studentId: string, lessonId: string, answers: number[]) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  if (lesson.quiz.length === 0) throw ApiError.badRequest("This lesson has no quiz");

  await assertStudentEnrolledInCourse(String(lesson.course), studentId);

  const results = lesson.quiz.map((q, index) => {
    const selected = answers[index];
    const correct = selected === q.correctIndex;
    return {
      question: q.question,
      options: q.options,
      selectedIndex: selected ?? null,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    };
  });

  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);

  const existing = await LessonProgress.findOne({ student: studentId, lesson: lessonId })
    .select("quizBestScore")
    .lean();
  const bestScore = Math.max(existing?.quizBestScore ?? 0, score);

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: { quizBestScore: bestScore, quizLastAttemptAt: new Date() },
      $inc: { quizAttempts: 1 },
      $setOnInsert: {
        topic: lesson.topic,
        module: lesson.module,
        course: lesson.course,
        completed: false,
      },
    },
    { upsert: true }
  );

  return { score, bestScore, results };
}

export async function getCourseProgress(studentId: string, courseId: string) {
  await assertStudentEnrolledInCourse(courseId, studentId);

  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();
  const topics = await Topic.find({ course: courseId }).sort({ order: 1 }).lean();
  const lessons = await Lesson.find({ course: courseId })
    .select("title topic module estimatedMinutes difficulty order")
    .sort({ order: 1 })
    .lean();
  const progressRows = await LessonProgress.find({ student: studentId, course: courseId })
    .select("lesson completed quizBestScore")
    .lean();
  const progressByLesson = new Map(progressRows.map((p) => [String(p.lesson), p]));
  const completedIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => String(p.lesson))
  );

  const lessonsByTopic = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = String(lesson.topic);
    if (!lessonsByTopic.has(key)) lessonsByTopic.set(key, []);
    lessonsByTopic.get(key)!.push(lesson);
  }

  const topicsByModule = new Map<string, typeof topics>();
  for (const topic of topics) {
    const key = String(topic.module);
    if (!topicsByModule.has(key)) topicsByModule.set(key, []);
    topicsByModule.get(key)!.push(topic);
  }

  const toLessonProgress = (l: (typeof lessons)[number]) => ({
    lessonId: l._id,
    title: l.title,
    estimatedMinutes: l.estimatedMinutes,
    difficulty: l.difficulty,
    order: l.order,
    completed: completedIds.has(String(l._id)),
    quizBestScore: progressByLesson.get(String(l._id))?.quizBestScore,
  });

  const moduleProgress = modules.map((mod) => {
    const moduleTopics = topicsByModule.get(String(mod._id)) ?? [];

    const topicProgress = moduleTopics.map((topic) => {
      const topicLessons = lessonsByTopic.get(String(topic._id)) ?? [];
      const completedCount = topicLessons.filter((l) => completedIds.has(String(l._id))).length;
      const progress =
        topicLessons.length > 0 ? Math.round((completedCount / topicLessons.length) * 100) : 0;

      return {
        topicId: topic._id,
        name: topic.name,
        order: topic.order,
        totalLessons: topicLessons.length,
        completedLessons: completedCount,
        progress,
        lessons: topicLessons.map(toLessonProgress),
      };
    });

    const moduleLessons = topicProgress.flatMap((t) => t.lessons);
    const completedCount = moduleLessons.filter((l) => l.completed).length;
    const progress =
      moduleLessons.length > 0 ? Math.round((completedCount / moduleLessons.length) * 100) : 0;

    return {
      moduleId: mod._id,
      name: mod.name,
      order: mod.order,
      totalLessons: moduleLessons.length,
      completedLessons: completedCount,
      progress,
      topics: topicProgress,
    };
  });

  const totalLessons = lessons.length;
  const totalCompleted = completedIds.size;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return { courseId, overallProgress, totalLessons, totalCompleted, modules: moduleProgress };
}

/** Admin/trainer view of one specific student's progress in a course (spec: admin/trainer can
 * see a student's completed topics / struggling students). Reuses getCourseProgress verbatim —
 * the only difference is who's asking and the access check that gates it. */
export async function getCourseProgressForStaff(
  requester: { id: string; role: Role },
  studentId: string,
  courseId: string
) {
  await assertCourseContentAccess(courseId, requester);
  return getCourseProgress(studentId, courseId);
}
