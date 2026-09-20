import { Router } from "express";
import * as enrollmentController from "../controllers/enrollment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { updateLastVisitedSchema } from "../validators/enrollment.validator";

const router = Router();

router.use(authenticate, authorize("STUDENT"));

router.get("/me", enrollmentController.listMyEnrollments);
router.patch(
  "/last-visited",
  validateBody(updateLastVisitedSchema),
  enrollmentController.updateLastVisited
);

export default router;
