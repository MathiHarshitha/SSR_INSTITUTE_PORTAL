import { randomInt } from "node:crypto";
import { FinalAssessment, IFinalAssessment } from "../models/FinalAssessment";
import { FinalAssessmentAttempt } from "../models/FinalAssessmentAttempt";
import { ApiError } from "../utils/ApiError";
import { assertCourseContentAccess, assertStudentEnrolledInCourse } from "../utils/batchAccess";
import { loadCourseProgressTree } from "../utils/lessonAccess";
import { Role } from "../constants/enums";
import { recordAudit } from "./auditLog.service";
import {
  CreateFinalAssessmentInput,
  UpdateFinalAssessmentInput,
} from "../validators/finalAssessment.validator";

/** After a failed attempt the student must wait this long before retaking — otherwise
 * unlimited instant retakes let the answer key be brute-forced one question at a time. */
export const FINAL_RETAKE_COOLDOWN_MINUTES = 60;
const FINAL_RETAKE_COOLDOWN_MS = FINAL_RETAKE_COOLDOWN_MINUTES * 60 * 1000;

/** Mirrors the model default, for comparing a trainer's first save against it. */
const DEFAULT_PASSING_SCORE = 60;

// ---- Authoring (admin/trainer) ----

type AssessmentQuestion = IFinalAssessment["questions"][number];

function normalizeQuestions(questions: readonly AssessmentQuestion[]) {
  return JSON.stringify(
    questions.map((q) => ({
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
    }))
  );
}

/** The final assessment gates course completion for every batch of the course, so a trainer
 * (scoped to their own batches) may not weaken it course-wide: publishing state and passing
 * score are admin-only, and questions are frozen once any student has attempted it. */
async function assertTrainerMayEditAssessment(
  requester: { id: string; role: Role },
  courseId: string,
  existing: Pick<IFinalAssessment, "published" | "passingScore" | "questions"> | null,
  input: UpdateFinalAssessmentInput
): Promise<void> {
  if (requester.role !== "TRAINER") return;

  const currentPublished = existing?.published ?? false;
  const currentPassingScore = existing?.passingScore ?? DEFAULT_PASSING_SCORE;
  if (input.published !== undefined && input.published !== currentPublished) {
    throw ApiError.forbidden("Only an admin can publish or unpublish the final assessment");
  }
  if (input.passingScore !== undefined && input.passingScore !== currentPassingScore) {
    throw ApiError.forbidden("Only an admin can change the final assessment's passing score");
  }
  if (
    existing &&
    input.questions !== undefined &&
    normalizeQuestions(input.questions) !== normalizeQuestions(existing.questions)
  ) {
    const attempted = await FinalAssessmentAttempt.exists({ course: courseId });
    if (attempted) {
      throw ApiError.forbidden(
        "Students have already attempted this final assessment — ask an admin to change its questions"
      );
    }
  }
}

export async function upsertFinalAssessment(
  requester: { id: string; role: Role },
  courseId: string,
  input: CreateFinalAssessmentInput
) {
  await assertCourseContentAccess(courseId, requester);
  const existing = await FinalAssessment.findOne({ course: courseId })
    .select("published passingScore questions")
    .lean();
  await assertTrainerMayEditAssessment(requester, courseId, existing, input);

  const assessment = await FinalAssessment.findOneAndUpdate(
    { course: courseId },
    { $set: { ...input, course: courseId }, $setOnInsert: { createdBy: requester.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await recordAudit({
    userId: requester.id,
    action: "FINAL_ASSESSMENT_SAVED",
    entity: "FinalAssessment",
    entityId: assessment._id,
    metadata: { course: courseId, passingScore: assessment.passingScore, published: assessment.published },
  });
  return assessment;
}

export async function updateFinalAssessment(
  requester: { id: string; role: Role },
  courseId: string,
  input: UpdateFinalAssessmentInput
) {
  const assessment = await FinalAssessment.findOne({ course: courseId });
  if (!assessment) throw ApiError.notFound("This course has no final assessment yet");
  await assertCourseContentAccess(courseId, requester);
  await assertTrainerMayEditAssessment(requester, courseId, assessment, input);

  Object.assign(assessment, input);
  await assessment.save();
  await recordAudit({
    userId: requester.id,
    action: "FINAL_ASSESSMENT_UPDATED",
    entity: "FinalAssessment",
    entityId: assessment._id,
    metadata: { course: courseId, passingScore: assessment.passingScore, published: assessment.published },
  });
  return assessment;
}

export async function getFinalAssessmentForAuthoring(
  requester: { id: string; role: Role },
  courseId: string
) {
  await assertCourseContentAccess(courseId, requester);
  return FinalAssessment.findOne({ course: courseId }).lean();
}

// ---- Student session (mirrors the lesson quiz state machine) ----

interface AttemptLike {
  status: string;
  currentIndex: number;
  order?: number[];
  attemptCount?: number;
  score?: number;
  passed?: boolean;
  submittedAt?: Date;
}

async function assertModulesCompleteForFinalAssessment(studentId: string, courseId: string) {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const tree = await loadCourseProgressTree(studentId, courseId);
  if (!tree.allModulesCompleted) {
    throw ApiError.forbidden("Complete every module before starting the final assessment");
  }
}

function stripAnswer(q: AssessmentQuestion) {
  return { question: q.question, options: q.options };
}

function shuffledOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Maps a position in this attempt's shuffled order to the assessment's question index.
 * Falls back to the natural order if the assessment's question count changed mid-attempt. */
function questionIndexAt(attempt: AttemptLike, position: number, totalQuestions: number): number {
  const order = attempt.order;
  if (order && order.length === totalQuestions) {
    const index = order[position];
    if (Number.isInteger(index) && index >= 0 && index < totalQuestions) return index;
  }
  return position;
}

/** When a failed attempt's student may start again, or undefined if they already can. */
function retryAvailableAt(attempt: AttemptLike | null): Date | undefined {
  if (!attempt || attempt.status === "IN_PROGRESS" || attempt.passed === true || !attempt.submittedAt) {
    return undefined;
  }
  const at = new Date(new Date(attempt.submittedAt).getTime() + FINAL_RETAKE_COOLDOWN_MS);
  return at.getTime() > Date.now() ? at : undefined;
}

function cooldownError(retryAt: Date): ApiError {
  const minutes = Math.max(1, Math.ceil((retryAt.getTime() - Date.now()) / 60000));
  return ApiError.tooMany(
    `You can retake the final assessment in ${minutes} minute${minutes === 1 ? "" : "s"} (at ${retryAt.toISOString()})`
  );
}

function publicAttemptState(attempt: AttemptLike, assessment: { questions: IFinalAssessment["questions"] }) {
  const totalQuestions = assessment.questions.length;
  if (attempt.status !== "IN_PROGRESS") {
    const retryAt = retryAvailableAt(attempt);
    return {
      status: attempt.status,
      totalQuestions,
      currentIndex: attempt.currentIndex,
      attemptCount: attempt.attemptCount ?? 0,
      // The exact score of a failed attempt is withheld — it's an oracle for the answer key.
      ...(attempt.passed ? { score: attempt.score } : {}),
      passed: attempt.passed,
      ...(retryAt ? { retryAvailableAt: retryAt } : {}),
      done: true,
    };
  }
  const done = attempt.currentIndex >= totalQuestions;
  return {
    status: attempt.status,
    totalQuestions,
    currentIndex: attempt.currentIndex,
    attemptCount: attempt.attemptCount ?? 0,
    done,
    question: done
      ? null
      : stripAnswer(assessment.questions[questionIndexAt(attempt, attempt.currentIndex, totalQuestions)]),
  };
}

async function loadPublishedAssessment(courseId: string) {
  const assessment = await FinalAssessment.findOne({ course: courseId, published: true }).lean();
  if (!assessment) throw ApiError.notFound("This course has no final assessment");
  return assessment;
}

export async function getFinalAssessmentState(studentId: string, courseId: string) {
  await assertModulesCompleteForFinalAssessment(studentId, courseId);
  const assessment = await loadPublishedAssessment(courseId);

  const attempt = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId }).lean();
  if (!attempt) return { status: "NOT_STARTED", totalQuestions: assessment.questions.length };
  return publicAttemptState(attempt, assessment);
}

export async function startFinalAssessment(studentId: string, courseId: string) {
  await assertModulesCompleteForFinalAssessment(studentId, courseId);
  const assessment = await loadPublishedAssessment(courseId);

  const existing = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId }).lean();
  if (existing && (existing.status === "IN_PROGRESS" || existing.passed)) {
    return publicAttemptState(existing, assessment);
  }
  const retryAt = retryAvailableAt(existing);
  if (retryAt) throw cooldownError(retryAt);

  // The guards live in the filter so concurrent starts can't both reset the attempt or slip
  // past the cooldown: a non-matching existing doc makes the upsert hit the unique
  // (student, course) index instead.
  const cutoff = new Date(Date.now() - FINAL_RETAKE_COOLDOWN_MS);
  let attempt;
  try {
    attempt = await FinalAssessmentAttempt.findOneAndUpdate(
      {
        student: studentId,
        course: courseId,
        status: { $ne: "IN_PROGRESS" },
        passed: { $ne: true },
        $or: [{ submittedAt: { $exists: false } }, { submittedAt: { $lte: cutoff } }],
      },
      {
        $set: {
          finalAssessment: assessment._id,
          status: "IN_PROGRESS",
          currentIndex: 0,
          answers: [],
          order: shuffledOrder(assessment.questions.length),
          startedAt: new Date(),
        },
        $inc: { attemptCount: 1 },
        $unset: { score: 1, passed: 1, submittedAt: 1 },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const current = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId }).lean();
    if (current && (current.status === "IN_PROGRESS" || current.passed)) {
      return publicAttemptState(current, assessment);
    }
    throw cooldownError(retryAvailableAt(current) ?? new Date(Date.now() + FINAL_RETAKE_COOLDOWN_MS));
  }

  await recordAudit({
    userId: studentId,
    action: "FINAL_ASSESSMENT_STARTED",
    entity: "FinalAssessmentAttempt",
    entityId: attempt._id,
    metadata: { course: courseId, attemptCount: attempt.attemptCount },
  });
  return publicAttemptState(attempt, assessment);
}

export async function answerFinalAssessmentQuestion(
  studentId: string,
  courseId: string,
  selectedIndex: number
) {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const assessment = await loadPublishedAssessment(courseId);
  const totalQuestions = assessment.questions.length;

  const attempt = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No final assessment is currently in progress");
  }
  if (attempt.currentIndex >= totalQuestions) {
    throw ApiError.badRequest("All questions have already been answered — submit the assessment");
  }
  const questionIndex = questionIndexAt(attempt, attempt.currentIndex, totalQuestions);
  if (selectedIndex >= assessment.questions[questionIndex].options.length) {
    throw ApiError.badRequest("Selected option does not exist");
  }

  // Answers are stored by original question index, so grading needn't know the order.
  const answers: (number | null)[] = Array.from({ length: totalQuestions }, (_, i) => attempt.answers[i] ?? null);
  answers[questionIndex] = selectedIndex;
  attempt.answers = answers;
  attempt.currentIndex += 1;
  await attempt.save();

  return publicAttemptState(attempt, assessment);
}

export async function submitFinalAssessment(studentId: string, courseId: string) {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const assessment = await loadPublishedAssessment(courseId);

  const attempt = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No final assessment is currently in progress");
  }

  const results = assessment.questions.map((q, index) => {
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
  const passed = score >= assessment.passingScore;

  attempt.status = "SUBMITTED";
  attempt.score = score;
  attempt.passed = passed;
  attempt.submittedAt = new Date();
  await attempt.save();

  await recordAudit({
    userId: studentId,
    action: "FINAL_ASSESSMENT_SUBMITTED",
    entity: "FinalAssessmentAttempt",
    entityId: attempt._id,
    metadata: { course: courseId, score, passed, attemptCount: attempt.attemptCount },
  });

  if (passed) return { score, passed, results, reviewAvailable: true };
  // Same rule as lesson quizzes: no answer key on a failed attempt — and no exact score
  // either, since score deltas between retakes reveal which answers were right.
  return {
    passed,
    passingScore: assessment.passingScore,
    results: [],
    reviewAvailable: false,
    retryAvailableAt: retryAvailableAt(attempt),
  };
}
