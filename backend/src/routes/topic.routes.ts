import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  createLessonSchema,
  reorderLessonsSchema,
  updateTopicSchema,
} from "../validators/module.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "TRAINER"));

router.patch("/:id", validateBody(updateTopicSchema), moduleController.updateTopic);
router.delete("/:id", moduleController.deleteTopic);

router.get("/:topicId/lessons", moduleController.listLessons);
router.post("/:topicId/lessons", validateBody(createLessonSchema), moduleController.createLesson);
router.patch(
  "/:topicId/lessons/reorder",
  validateBody(reorderLessonsSchema),
  moduleController.reorderLessons
);

export default router;
