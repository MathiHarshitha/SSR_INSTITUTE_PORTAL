import { Lesson, ILesson } from "../models/Lesson";
import { LessonProgress } from "../models/LessonProgress";
import { CodingSubmission } from "../models/CodingSubmission";
import { ApiError } from "../utils/ApiError";
import { assertLessonUnlocked } from "../utils/lessonAccess";
import { getLessonStageStatus } from "../utils/progressState";
import { runCodingSubmission } from "../utils/codingJudge";
import { maybeCompleteLesson } from "./progress.service";

export async function getCodingState(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).select("codingQuestion").lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);
  if (!lesson.codingQuestion) throw ApiError.badRequest("This lesson has no coding question");

  const lastSubmission = await CodingSubmission.findOne({ student: studentId, lesson: lessonId })
    .sort({ createdAt: -1 })
    .select("code passed testResults createdAt")
    .lean();

  return { lastSubmission: lastSubmission ?? null };
}

/** Grades server-side in a sandboxed VM (spec-driven choice: sandboxed auto-grading) —
 * never trusts a client-reported pass/fail. Requires the quiz stage cleared first, matching
 * the Lesson → Practice → Quiz → Coding → Completed order. */
export async function submitCodingAnswer(studentId: string, lessonId: string, code: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  if (!lesson.codingQuestion) throw ApiError.badRequest("This lesson has no coding question");

  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId }).lean();
  const stage = getLessonStageStatus(lesson as never, progress ?? undefined);
  if (stage.practiceRequired && !stage.practiceDone) {
    throw ApiError.forbidden("Complete the practice exercise first");
  }
  if (stage.quizRequired && !stage.quizDone) {
    throw ApiError.forbidden("Pass the quiz before attempting the coding question");
  }

  const { passed, testResults } = runCodingSubmission(lesson.codingQuestion, code);

  await CodingSubmission.create({ student: studentId, lesson: lessonId, code, passed, testResults });

  if (passed) {
    await LessonProgress.findOneAndUpdate(
      { student: studentId, lesson: lessonId },
      {
        $set: { codingCompleted: true, codingCompletedAt: new Date() },
        $setOnInsert: { topic: lesson.topic, module: lesson.module, course: lesson.course },
      },
      { upsert: true }
    );
  }

  const completion = await maybeCompleteLesson(studentId, lesson as unknown as ILesson);

  return { passed, testResults, lessonCompleted: completion.completed };
}
