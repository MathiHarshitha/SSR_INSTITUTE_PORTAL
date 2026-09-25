import { Lesson, ILesson } from "../models/Lesson";
import { Module } from "../models/Module";
import { Topic } from "../models/Topic";
import { LessonProgress } from "../models/LessonProgress";
import { ApiError } from "../utils/ApiError";
import {
  assertCourseContentAccess,
  assertStudentEnrolledInCourse,
  listTrainerBatchIds,
} from "../utils/batchAccess";
import { Enrollment } from "../models/Enrollment";
import {
  assertLessonUnlocked,
  isCourseCompleted,
  loadCourseProgressTree,
} from "../utils/lessonAccess";
import { getLessonStageStatus, isLessonStagesComplete } from "../utils/progressState";
import { FinalAssessment } from "../models/FinalAssessment";
import { Role } from "../constants/enums";

/** Full lesson content for a student, gated by enrollment + sequential lock state (spec
 * §2/§3/§8: not-enrolled or not-yet-reached lessons are rejected; completed lessons stay
 * open for revision). Quiz answers and coding test cases are stripped either way. */
export async function getLessonForStudent(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson || !lesson.published) throw ApiError.notFound("Lesson not found");

  const node = await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId })
    .select("completed practiceCompleted quizPassed codingCompleted quizBestScore quizAttempts")
    .lean();

  return {
    ...lesson,
    quiz: lesson.quiz.map((q) => ({ question: q.question, options: q.options })),
    codingQuestion: lesson.codingQuestion
      ? {
          prompt: lesson.codingQuestion.prompt,
          starterCode: lesson.codingQuestion.starterCode,
          functionName: lesson.codingQuestion.functionName,
        }
      : null,
    completed: progress?.completed ?? false,
    practiceCompleted: progress?.practiceCompleted ?? false,
    quizPassed: progress?.quizPassed ?? false,
    codingCompleted: progress?.codingCompleted ?? false,
    quizBestScore: progress?.quizBestScore,
    quizAttempts: progress?.quizAttempts ?? 0,
    lockState: node.state,
    stage: node.stage,
  };
}

/** Marks the "practice" stage done. Never auto-triggered by viewing — requires the explicit
 * student action of submitting/completing the practice exercise. */
export async function markPracticeComplete(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  if (!lesson.practice) throw ApiError.badRequest("This lesson has no practice exercise");

  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: { practiceCompleted: true, practiceCompletedAt: new Date() },
      $setOnInsert: { topic: lesson.topic, module: lesson.module, course: lesson.course },
    },
    { upsert: true }
  );

  return maybeCompleteLesson(studentId, lesson as unknown as ILesson);
}

/** A lesson auto-completes the instant every stage it actually has (practice/quiz/coding)
 * is cleared — no separate "mark complete" click required once the last stage finishes. */
export async function maybeCompleteLesson(studentId: string, lesson: ILesson | (ILesson & { _id: unknown })) {
  const progress = await LessonProgress.findOne({ student: studentId, lesson: lesson._id }).lean();
  const stage = getLessonStageStatus(lesson as never, progress ?? undefined);
  const nowComplete = isLessonStagesComplete(stage);

  if (nowComplete && !progress?.completed) {
    await LessonProgress.findOneAndUpdate(
      { student: studentId, lesson: lesson._id },
      { $set: { completed: true, completedAt: new Date() } }
    );
  }

  return { completed: nowComplete, stage };
}

/** Explicit completion for lessons with no practice/quiz/coding stage at all (plain
 * reading lessons) — for staged lessons this just confirms what auto-completion already
 * did once every stage cleared; it can never skip ahead of the stage gates. */
export async function markLessonComplete(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");

  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId }).lean();
  const stage = getLessonStageStatus(lesson as never, progress ?? undefined);
  if (!isLessonStagesComplete(stage)) {
    throw ApiError.badRequest("Complete the practice, quiz, and coding question first");
  }

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

export async function getCourseProgress(studentId: string, courseId: string) {
  await assertStudentEnrolledInCourse(courseId, studentId);

  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();
  const topics = await Topic.find({ course: courseId }).sort({ order: 1 }).lean();
  const lessons = await Lesson.find({ course: courseId, published: { $ne: false } })
    .select("title topic module estimatedMinutes difficulty order practice quiz codingQuestion")
    .sort({ order: 1 })
    .lean();
  const progressRows = await LessonProgress.find({ student: studentId, course: courseId })
    .select("lesson completed practiceCompleted quizPassed codingCompleted quizBestScore quizAttempts")
    .lean();

  const tree = await loadCourseProgressTree(studentId, courseId);
  const progressByLesson = new Map(progressRows.map((p) => [String(p.lesson), p]));

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

  const toLessonProgress = (l: (typeof lessons)[number]) => {
    const node = tree.lessons.get(String(l._id));
    return {
      lessonId: l._id,
      title: l.title,
      estimatedMinutes: l.estimatedMinutes,
      difficulty: l.difficulty,
      order: l.order,
      state: node?.state ?? "LOCKED",
      completed: node?.state === "COMPLETED",
      quizBestScore: progressByLesson.get(String(l._id))?.quizBestScore,
    };
  };

  const moduleProgress = Array.from(tree.modules.keys()).map((moduleId) => {
    const mod = modules.find((m) => String(m._id) === moduleId)!;
    const moduleTopics = topicsByModule.get(moduleId) ?? [];

    const topicProgress = moduleTopics.map((topic) => {
      const topicId = String(topic._id);
      const topicLessons = lessonsByTopic.get(topicId) ?? [];
      const completedCount = topicLessons.filter(
        (l) => tree.lessons.get(String(l._id))?.state === "COMPLETED"
      ).length;
      const progress =
        topicLessons.length > 0 ? Math.round((completedCount / topicLessons.length) * 100) : 0;

      return {
        topicId: topic._id,
        name: topic.name,
        order: topic.order,
        state: tree.topics.get(topicId)?.state ?? "LOCKED",
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
      state: tree.modules.get(moduleId)?.state ?? "LOCKED",
      totalLessons: moduleLessons.length,
      completedLessons: completedCount,
      progress,
      topics: topicProgress,
    };
  });

  const finalAssessment = await FinalAssessment.findOne({ course: courseId, published: true })
    .select("_id passingScore")
    .lean();
  const courseCompleted = await isCourseCompleted(studentId, courseId);

  return {
    courseId,
    overallProgress: tree.overallProgress,
    totalLessons: tree.totalLessons,
    totalCompleted: tree.completedLessons,
    allModulesCompleted: tree.allModulesCompleted,
    finalAssessmentUnlocked: tree.allModulesCompleted,
    hasFinalAssessment: !!finalAssessment,
    courseCompleted,
    certificateUnlocked: courseCompleted,
    careerResourcesUnlocked: courseCompleted,
    modules: moduleProgress,
  };
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
  // Teaching the course isn't enough: a trainer may only see students in their own batches.
  if (requester.role === "TRAINER") {
    const trainerBatchIds = await listTrainerBatchIds(requester.id);
    const shared = await Enrollment.exists({
      student: studentId,
      course: courseId,
      batch: { $in: trainerBatchIds },
    });
    if (!shared) throw ApiError.forbidden("This student is not in one of your batches");
  }
  return getCourseProgress(studentId, courseId);
}
