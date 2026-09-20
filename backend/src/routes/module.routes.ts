import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  createTopicSchema,
  reorderTopicsSchema,
  updateModuleSchema,
} from "../validators/module.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN", "TRAINER"));

router.patch("/:id", validateBody(updateModuleSchema), moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

router.get("/:moduleId/topics", moduleController.listTopics);
router.post("/:moduleId/topics", validateBody(createTopicSchema), moduleController.createTopic);
router.patch(
  "/:moduleId/topics/reorder",
  validateBody(reorderTopicsSchema),
  moduleController.reorderTopics
);

export default router;
