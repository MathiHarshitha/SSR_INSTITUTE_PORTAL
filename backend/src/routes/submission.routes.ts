import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { evaluateSubmissionSchema } from "../validators/task.validator";

const router = Router();

router.get(
  "/pending",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  taskController.listPendingSubmissions
);

router.patch(
  "/:submissionId/evaluate",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  validateBody(evaluateSubmissionSchema),
  taskController.evaluateSubmission
);

export default router;
