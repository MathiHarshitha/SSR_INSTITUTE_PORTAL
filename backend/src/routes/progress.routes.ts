import { Router } from "express";
import * as progressController from "../controllers/progress.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("STUDENT"));

router.get("/courses/:courseId", progressController.getCourseProgress);
router.post("/lessons/:lessonId/complete", progressController.markComplete);
router.delete("/lessons/:lessonId/complete", progressController.unmarkComplete);

export default router;
