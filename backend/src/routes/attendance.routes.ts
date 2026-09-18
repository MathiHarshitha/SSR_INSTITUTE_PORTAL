import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import { listAttendanceQuerySchema, markAttendanceSchema } from "../validators/attendance.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "TRAINER"));

router.get("/", validateQuery(listAttendanceQuerySchema), attendanceController.listAttendance);
router.post("/mark", validateBody(markAttendanceSchema), attendanceController.markAttendance);
router.get("/summary/:batchId", attendanceController.getSummary);

export default router;
