import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createJobSchema,
  listApplicationsQuerySchema,
  listJobsQuerySchema,
  updateApplicationStatusSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from "../validators/job.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", validateQuery(listJobsQuerySchema), jobController.listJobs);
router.post("/", validateBody(createJobSchema), jobController.createJob);
router.get("/:id", jobController.getJob);
router.patch("/:id", validateBody(updateJobSchema), jobController.updateJob);
router.patch("/:id/status", validateBody(updateJobStatusSchema), jobController.updateJobStatus);
router.get(
  "/:id/applications",
  validateQuery(listApplicationsQuerySchema),
  jobController.listApplications
);
router.patch(
  "/applications/:applicationId/status",
  validateBody(updateApplicationStatusSchema),
  jobController.updateApplicationStatus
);

export default router;
