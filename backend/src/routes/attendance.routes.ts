import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import { listAttendanceQuerySchema, markAttendanceSchema } from "../validators/attendance.validator";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "TRAINER", "STUDENT"),
  validateQuery(listAttendanceQuerySchema),
  attendanceController.listAttendance
);
router.post(
  "/mark",
  authorize("ADMIN", "TRAINER"),
  validateBody(markAttendanceSchema),
  attendanceController.markAttendance
);
router.get("/summary/:batchId", authorize("ADMIN", "TRAINER", "STUDENT"), attendanceController.getSummary);

export default router;
