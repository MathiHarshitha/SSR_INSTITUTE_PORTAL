import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  createLessonSchema,
  reorderLessonsSchema,
  updateModuleSchema,
} from "../validators/module.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.patch("/:id", validateBody(updateModuleSchema), moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

router.get("/:moduleId/lessons", moduleController.listLessons);
router.post("/:moduleId/lessons", validateBody(createLessonSchema), moduleController.createLesson);
router.patch(
  "/:moduleId/lessons/reorder",
  validateBody(reorderLessonsSchema),
  moduleController.reorderLessons
);

export default router;
