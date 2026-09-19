import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/overview", reportController.getOverview);

export default router;
