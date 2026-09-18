import { Router } from "express";
import * as mockInterviewController from "../controllers/mockInterview.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  listInterviewsQuerySchema,
  recordFeedbackSchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
} from "../validators/mockInterview.validator";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listInterviewsQuerySchema), mockInterviewController.listInterviews);
router.post(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateBody(scheduleInterviewSchema),
  mockInterviewController.scheduleInterview
);
router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateInterviewSchema),
  mockInterviewController.updateInterview
);
router.patch(
  "/:id/feedback",
  authorize("ADMIN", "TRAINER"),
  validateBody(recordFeedbackSchema),
  mockInterviewController.recordFeedback
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), mockInterviewController.deleteInterview);

export default router;
