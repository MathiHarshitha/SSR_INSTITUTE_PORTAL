import { Router } from "express";
import * as careerResourcesController from "../controllers/careerResources.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get(
  "/status",
  authenticate,
  authorize("STUDENT"),
  careerResourcesController.getCareerResourcesStatus
);

export default router;
