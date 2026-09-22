import { Router } from "express";
import * as interviewResourceController from "../controllers/interviewResource.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody } from "../middleware/validate";
import {
  createInterviewResourceSchema,
  updateInterviewResourceSchema,
} from "../validators/interviewResource.validator";

const router = Router();

router.use(authenticate);

router.get("/", authorize("STUDENT"), interviewResourceController.listInterviewResourcesForStudent);
router.get("/admin", authorize("ADMIN", "TRAINER"), interviewResourceController.listInterviewResourcesAdmin);
router.post(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateBody(createInterviewResourceSchema),
  interviewResourceController.createInterviewResource
);
router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateInterviewResourceSchema),
  interviewResourceController.updateInterviewResource
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), interviewResourceController.deleteInterviewResource);

export default router;
