import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import * as quizAttemptController from "../controllers/quizAttempt.controller";
import * as codingController from "../controllers/coding.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { codingSubmitLimiter } from "../middleware/rateLimiters";
import {
  answerQuizQuestionSchema,
  submitCodingAnswerSchema,
  updateLessonSchema,
} from "../validators/module.validator";

const router = Router();

router.use(authenticate);

// Full lesson content — role-branched inside the controller (admin/trainer authoring view
// vs. student learner view, gated by enrollment + sequential lock state, quiz answers and
// coding test cases stripped).
router.get("/:id", authorize("ADMIN", "TRAINER", "STUDENT"), moduleController.getLesson);

router.post("/:id/practice/complete", authorize("STUDENT"), moduleController.markPracticeComplete);

// Quiz session — server-side state machine (spec §7): no back-nav, no reopening submitted
// questions, refresh/browser-back-safe, only Next/Submit/Quit exposed to the client.
router.get("/:id/quiz/state", authorize("STUDENT"), quizAttemptController.getQuizState);
router.post("/:id/quiz/start", authorize("STUDENT"), quizAttemptController.startQuiz);
router.post(
  "/:id/quiz/answer",
  authorize("STUDENT"),
  validateBody(answerQuizQuestionSchema),
  quizAttemptController.answerQuizQuestion
);
router.post("/:id/quiz/submit", authorize("STUDENT"), quizAttemptController.submitQuiz);
router.post("/:id/quiz/quit", authorize("STUDENT"), quizAttemptController.quitQuiz);

// Coding question — sandboxed auto-grading.
router.get("/:id/coding/state", authorize("STUDENT"), codingController.getCodingState);
router.post(
  "/:id/coding/submit",
  authorize("STUDENT"),
  codingSubmitLimiter,
  validateBody(submitCodingAnswerSchema),
  codingController.submitCodingAnswer
);

router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateLessonSchema),
  moduleController.updateLesson
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), moduleController.deleteLesson);

export default router;
