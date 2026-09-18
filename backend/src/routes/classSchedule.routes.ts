import { Router } from "express";
import * as classScheduleController from "../controllers/classSchedule.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createClassScheduleSchema,
  listClassSchedulesQuerySchema,
  updateClassScheduleSchema,
} from "../validators/classSchedule.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "TRAINER"));

router.get("/", validateQuery(listClassSchedulesQuerySchema), classScheduleController.listClasses);
router.post("/", validateBody(createClassScheduleSchema), classScheduleController.createClass);
router.patch("/:id", validateBody(updateClassScheduleSchema), classScheduleController.updateClass);
router.delete("/:id", classScheduleController.deleteClass);

export default router;
