import { Lesson, ILesson } from "../models/Lesson";
import { LessonProgress } from "../models/LessonProgress";
import { CodingSubmission } from "../models/CodingSubmission";
import { ApiError } from "../utils/ApiError";
import { assertLessonUnlocked } from "../utils/lessonAccess";
import { getLessonStageStatus } from "../utils/progressState";
import { runCodingSubmission } from "../utils/codingJudge";
import { maybeCompleteLesson } from "./progress.service";
import { recordAudit } from "./auditLog.service";
import { ITestResult } from "../models/CodingSubmission";

/** Older submissions per (student, lesson) beyond this many are pruned on each new one. */
const MAX_STORED_SUBMISSIONS_PER_LESSON = 20;

/** Students with a submission currently being graded — one in-flight judge per user, so a
 * single student can't occupy every grader slot. */
const gradingInFlight = new Set<string>();

/** What a student may see about each test: pass/fail and an error, never the test's inputs or
 * expected output — otherwise hidden test cases can simply be hard-coded. A runtime error's
 * message can echo an input (e.g. `JSON.parse(arg)`, `throw new Error(String(arg))`), so only
 * grader-generated messages are passed through; anything else is reduced to its error type. */
function toStudentTestResults(results: ITestResult[]) {
  return results.map((r) => {
    if (!r.error) return { passed: r.passed };
    const error = r.graderError ? r.error : `${r.errorName ?? "Error"}: runtime error`;
    return { passed: r.passed, error };
  });
}

export async function getCodingState(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).select("codingQuestion").lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);
  if (!lesson.codingQuestion) throw ApiError.badRequest("This lesson has no coding question");

  const lastSubmission = await CodingSubmission.findOne({ student: studentId, lesson: lessonId })
    .sort({ createdAt: -1 })
    .select("code passed testResults createdAt")
    .lean();

  return {
    lastSubmission: lastSubmission
      ? { ...lastSubmission, testResults: toStudentTestResults(lastSubmission.testResults) }
      : null,
  };
}

/** Grades server-side in an isolated process (see utils/codingJudge.ts) —
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

  if (gradingInFlight.has(studentId)) {
    throw ApiError.tooMany("Your previous submission is still being graded");
  }
  gradingInFlight.add(studentId);
  let graded: Awaited<ReturnType<typeof runCodingSubmission>>;
  try {
    graded = await runCodingSubmission(lesson.codingQuestion, code);
  } finally {
    gradingInFlight.delete(studentId);
  }
  const { passed, testResults } = graded;

  const submission = await CodingSubmission.create({ student: studentId, lesson: lessonId, code, passed, testResults });

  // Keep only the most recent submissions (getCodingState reads just the latest one).
  const stale = await CodingSubmission.find({ student: studentId, lesson: lessonId })
    .sort({ createdAt: -1 })
    .skip(MAX_STORED_SUBMISSIONS_PER_LESSON)
    .select("_id")
    .lean();
  if (stale.length > 0) {
    await CodingSubmission.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
  }

  await recordAudit({
    userId: studentId,
    action: "CODING_SUBMITTED",
    entity: "CodingSubmission",
    entityId: submission._id,
    metadata: { lesson: lessonId, passed },
  });

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

  return { passed, testResults: toStudentTestResults(testResults), lessonCompleted: completion.completed };
}
