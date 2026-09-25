import { Lesson, ILesson } from "../models/Lesson";
import { LessonProgress } from "../models/LessonProgress";
import { QuizAttempt } from "../models/QuizAttempt";
import { ApiError } from "../utils/ApiError";
import { assertLessonUnlocked } from "../utils/lessonAccess";
import { getLessonStageStatus } from "../utils/progressState";
import { QUIZ_PASS_PERCENT } from "../constants/enums";
import { maybeCompleteLesson } from "./progress.service";

/**
 * Server-side quiz session state machine (spec §7: no going back, no reopening submitted
 * questions, only Next/Submit/Quit, refresh-safe, back-nav can't bypass state). The client
 * is only ever handed the question at the attempt's current index — never the full quiz,
 * never a previous question's data — so there is nothing for a direct API call to exploit
 * beyond what the state machine already allows.
 */

function stripAnswer(question: ILesson["quiz"][number]) {
  return { question: question.question, options: question.options };
}

async function loadLessonAndAssertQuizStage(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  if (!lesson.quiz || lesson.quiz.length === 0) throw ApiError.badRequest("This lesson has no quiz");

  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const progress = await LessonProgress.findOne({ student: studentId, lesson: lessonId }).lean();
  const stage = getLessonStageStatus(lesson as never, progress ?? undefined);
  if (stage.practiceRequired && !stage.practiceDone) {
    throw ApiError.forbidden("Complete the practice exercise before starting the quiz");
  }

  return lesson;
}

function publicAttemptState(
  attempt: { status: string; currentIndex: number; score?: number },
  lesson: { quiz: ILesson["quiz"] }
) {
  const totalQuestions = lesson.quiz.length;
  if (attempt.status !== "IN_PROGRESS") {
    return {
      status: attempt.status,
      totalQuestions,
      currentIndex: attempt.currentIndex,
      score: attempt.score,
      done: true,
    };
  }
  const done = attempt.currentIndex >= totalQuestions;
  return {
    status: attempt.status,
    totalQuestions,
    currentIndex: attempt.currentIndex,
    done,
    question: done ? null : stripAnswer(lesson.quiz[attempt.currentIndex]),
  };
}

export async function getQuizState(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).select("quiz").lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const attempt = await QuizAttempt.findOne({ student: studentId, lesson: lessonId }).lean();
  if (!attempt) return { status: "NOT_STARTED", totalQuestions: lesson.quiz.length };
  return publicAttemptState(attempt, lesson);
}

export async function startQuiz(studentId: string, lessonId: string) {
  const lesson = await loadLessonAndAssertQuizStage(studentId, lessonId);

  const existing = await QuizAttempt.findOne({ student: studentId, lesson: lessonId });
  if (existing && existing.status === "IN_PROGRESS") {
    return publicAttemptState(existing, lesson);
  }

  const attempt = await QuizAttempt.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    { $set: { status: "IN_PROGRESS", currentIndex: 0, answers: [], startedAt: new Date() }, $unset: { score: 1, submittedAt: 1 } },
    { upsert: true, new: true }
  );

  return publicAttemptState(attempt, lesson);
}

export async function answerQuizQuestion(studentId: string, lessonId: string, selectedIndex: number) {
  const lesson = await Lesson.findById(lessonId).select("quiz course").lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const attempt = await QuizAttempt.findOne({ student: studentId, lesson: lessonId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No quiz is currently in progress — start the quiz first");
  }
  if (attempt.currentIndex >= lesson.quiz.length) {
    throw ApiError.badRequest("All questions have already been answered — submit the quiz");
  }
  if (selectedIndex >= lesson.quiz[attempt.currentIndex].options.length) {
    throw ApiError.badRequest("Selected option does not exist");
  }

  attempt.answers[attempt.currentIndex] = selectedIndex;
  attempt.currentIndex += 1;
  await attempt.save();

  return publicAttemptState(attempt, lesson);
}

export async function submitQuiz(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const attempt = await QuizAttempt.findOne({ student: studentId, lesson: lessonId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No quiz is currently in progress — start the quiz first");
  }

  const results = lesson.quiz.map((q, index) => {
    const selected = attempt.answers[index] ?? null;
    const correct = selected === q.correctIndex;
    return {
      question: q.question,
      options: q.options,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    };
  });

  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  const passed = score >= QUIZ_PASS_PERCENT;

  attempt.status = "SUBMITTED";
  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();

  const existingProgress = await LessonProgress.findOne({ student: studentId, lesson: lessonId })
    .select("quizBestScore quizPassed")
    .lean();
  const bestScore = Math.max(existingProgress?.quizBestScore ?? 0, score);

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: {
        quizBestScore: bestScore,
        quizLastAttemptAt: new Date(),
        quizPassed: (existingProgress?.quizPassed ?? false) || passed,
        ...(passed ? { quizPassedAt: new Date() } : {}),
      },
      $inc: { quizAttempts: 1 },
      $setOnInsert: { topic: lesson.topic, module: lesson.module, course: lesson.course, completed: false },
    },
    { upsert: true }
  );

  const completion = await maybeCompleteLesson(studentId, lesson as unknown as ILesson);

  // The answer key (and per-question right/wrong) is only revealed once the quiz is passed —
  // revealing it on a failed attempt makes the immediate retake a guaranteed pass.
  return {
    score,
    bestScore,
    passed,
    results: passed ? results : [],
    reviewAvailable: passed,
    lessonCompleted: completion.completed,
  };
}

export async function quitQuiz(studentId: string, lessonId: string) {
  const lesson = await Lesson.findById(lessonId).select("topic module course").lean();
  if (!lesson) throw ApiError.notFound("Lesson not found");
  await assertLessonUnlocked(studentId, lesson as unknown as ILesson);

  const attempt = await QuizAttempt.findOne({ student: studentId, lesson: lessonId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No quiz is currently in progress");
  }

  attempt.status = "QUIT";
  attempt.score = 0;
  attempt.submittedAt = new Date();
  await attempt.save();

  await LessonProgress.findOneAndUpdate(
    { student: studentId, lesson: lessonId },
    {
      $set: { quizLastAttemptAt: new Date() },
      $inc: { quizAttempts: 1 },
      $setOnInsert: {
        topic: lesson.topic,
        module: lesson.module,
        course: lesson.course,
        completed: false,
        quizPassed: false,
      },
    },
    { upsert: true }
  );

  return { score: 0, quit: true };
}
