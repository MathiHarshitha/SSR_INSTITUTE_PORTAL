import { Router } from "express";
import * as trainerDashboardController from "../controllers/trainerDashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.get("/trainer", authenticate, authorize("TRAINER"), trainerDashboardController.getTrainerDashboard);
router.get("/student", authenticate, authorize("STUDENT"), trainerDashboardController.getStudentDashboard);

export default router;
