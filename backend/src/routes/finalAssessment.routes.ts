import { Router } from "express";
import * as finalAssessmentController from "../controllers/finalAssessment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  answerFinalAssessmentSchema,
  createFinalAssessmentSchema,
  updateFinalAssessmentSchema,
} from "../validators/finalAssessment.validator";

const router = Router();

router.use(authenticate);

// Admin/trainer authoring — one final assessment per course.
router.get(
  "/courses/:courseId/authoring",
  authorize("ADMIN", "TRAINER"),
  finalAssessmentController.getFinalAssessmentForAuthoring
);
router.post(
  "/courses/:courseId",
  authorize("ADMIN", "TRAINER"),
  validateBody(createFinalAssessmentSchema),
  finalAssessmentController.upsertFinalAssessment
);
router.patch(
  "/courses/:courseId",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateFinalAssessmentSchema),
  finalAssessmentController.updateFinalAssessment
);

// Student session — unlocked only once every module in the course is complete.
router.get(
  "/courses/:courseId/state",
  authorize("STUDENT"),
  finalAssessmentController.getFinalAssessmentState
);
router.post(
  "/courses/:courseId/start",
  authorize("STUDENT"),
  finalAssessmentController.startFinalAssessment
);
router.post(
  "/courses/:courseId/answer",
  authorize("STUDENT"),
  validateBody(answerFinalAssessmentSchema),
  finalAssessmentController.answerFinalAssessmentQuestion
);
router.post(
  "/courses/:courseId/submit",
  authorize("STUDENT"),
  finalAssessmentController.submitFinalAssessment
);

export default router;
