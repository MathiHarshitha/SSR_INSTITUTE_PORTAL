import { Router } from "express";
import * as progressController from "../controllers/progress.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// Admin/trainer read-only view of one student's progress in a course (trainer must be
// assigned to that course — checked inside the service).
router.get(
  "/students/:studentId/courses/:courseId",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  progressController.getStudentCourseProgressForStaff
);

router.use(authenticate, authorize("STUDENT"));

router.get("/courses/:courseId", progressController.getCourseProgress);
router.post("/lessons/:lessonId/complete", progressController.markComplete);
router.delete("/lessons/:lessonId/complete", progressController.unmarkComplete);

export default router;
