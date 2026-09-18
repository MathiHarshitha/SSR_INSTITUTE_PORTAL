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

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "TRAINER", "STUDENT"),
  validateQuery(listClassSchedulesQuerySchema),
  classScheduleController.listClasses
);
router.post("/", authorize("ADMIN", "TRAINER"), validateBody(createClassScheduleSchema), classScheduleController.createClass);
router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateClassScheduleSchema),
  classScheduleController.updateClass
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), classScheduleController.deleteClass);

export default router;
