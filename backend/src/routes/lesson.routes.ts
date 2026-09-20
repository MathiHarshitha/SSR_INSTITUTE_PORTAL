import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { submitQuizSchema, updateLessonSchema } from "../validators/module.validator";

const router = Router();

router.use(authenticate);

// Full lesson content — role-branched inside the controller (admin/trainer authoring view
// vs. student learner view with quiz answers stripped).
router.get("/:id", authorize("ADMIN", "TRAINER", "STUDENT"), moduleController.getLesson);

router.post(
  "/:id/quiz/submit",
  authorize("STUDENT"),
  validateBody(submitQuizSchema),
  moduleController.submitLessonQuiz
);

router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateLessonSchema),
  moduleController.updateLesson
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), moduleController.deleteLesson);

export default router;
