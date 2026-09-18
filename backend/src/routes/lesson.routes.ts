import { Router } from "express";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import { updateLessonSchema } from "../validators/module.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.patch("/:id", validateBody(updateLessonSchema), moduleController.updateLesson);
router.delete("/:id", moduleController.deleteLesson);

export default router;
