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

// ---- Authoring (admin/trainer) ----

export async function upsertFinalAssessment(
  requester: { id: string; role: Role },
  courseId: string,
  input: CreateFinalAssessmentInput
) {
  await assertCourseContentAccess(courseId, requester);

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

async function assertModulesCompleteForFinalAssessment(studentId: string, courseId: string) {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const tree = await loadCourseProgressTree(studentId, courseId);
  if (!tree.allModulesCompleted) {
    throw ApiError.forbidden("Complete every module before starting the final assessment");
  }
}

function stripAnswer(q: IFinalAssessment["questions"][number]) {
  return { question: q.question, options: q.options };
}

function publicAttemptState(
  attempt: { status: string; currentIndex: number; score?: number; passed?: boolean },
  assessment: { questions: IFinalAssessment["questions"] }
) {
  const totalQuestions = assessment.questions.length;
  if (attempt.status !== "IN_PROGRESS") {
    return {
      status: attempt.status,
      totalQuestions,
      currentIndex: attempt.currentIndex,
      score: attempt.score,
      passed: attempt.passed,
      done: true,
    };
  }
  const done = attempt.currentIndex >= totalQuestions;
  return {
    status: attempt.status,
    totalQuestions,
    currentIndex: attempt.currentIndex,
    done,
    question: done ? null : stripAnswer(assessment.questions[attempt.currentIndex]),
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

  const existing = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId });
  if (existing && existing.status === "IN_PROGRESS") return publicAttemptState(existing, assessment);
  if (existing && existing.passed) {
    return publicAttemptState(existing, assessment);
  }

  const attempt = await FinalAssessmentAttempt.findOneAndUpdate(
    { student: studentId, course: courseId },
    {
      $set: {
        finalAssessment: assessment._id,
        status: "IN_PROGRESS",
        currentIndex: 0,
        answers: [],
        startedAt: new Date(),
      },
      $unset: { score: 1, passed: 1, submittedAt: 1 },
    },
    { upsert: true, new: true }
  );
  return publicAttemptState(attempt, assessment);
}

export async function answerFinalAssessmentQuestion(
  studentId: string,
  courseId: string,
  selectedIndex: number
) {
  await assertStudentEnrolledInCourse(courseId, studentId);
  const assessment = await loadPublishedAssessment(courseId);

  const attempt = await FinalAssessmentAttempt.findOne({ student: studentId, course: courseId });
  if (!attempt || attempt.status !== "IN_PROGRESS") {
    throw ApiError.badRequest("No final assessment is currently in progress");
  }
  if (attempt.currentIndex >= assessment.questions.length) {
    throw ApiError.badRequest("All questions have already been answered — submit the assessment");
  }
  if (selectedIndex >= assessment.questions[attempt.currentIndex].options.length) {
    throw ApiError.badRequest("Selected option does not exist");
  }

  attempt.answers[attempt.currentIndex] = selectedIndex;
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

  // Same rule as lesson quizzes: no answer key on a failed attempt, or the retake is trivial.
  return { score, passed, results: passed ? results : [], reviewAvailable: passed };
}
