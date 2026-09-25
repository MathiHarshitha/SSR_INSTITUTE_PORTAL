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
import { z } from "zod";
import { httpUrl } from "../validators/common";

const router = Router();

router.use(authenticate);

// Student-facing — registered before the admin "/:id" routes below so "/public"
// and "/applications" aren't swallowed by the ":id" wildcard.
router.get("/public", authorize("STUDENT"), jobController.listPublicJobs);
router.get("/applications/me", authorize("STUDENT"), jobController.listMyApplications);
router.post(
  "/applications/:applicationId/withdraw",
  authorize("STUDENT"),
  jobController.withdrawApplication
);
router.post(
  "/:id/apply",
  authorize("STUDENT"),
  validateBody(z.object({ resumeUrl: httpUrl().optional() })),
  jobController.applyToJob
);

// Admin job management.
router.get("/", authorize("ADMIN"), validateQuery(listJobsQuerySchema), jobController.listJobs);
router.post("/", authorize("ADMIN"), validateBody(createJobSchema), jobController.createJob);
router.get("/:id", authorize("ADMIN"), jobController.getJob);
router.patch("/:id", authorize("ADMIN"), validateBody(updateJobSchema), jobController.updateJob);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validateBody(updateJobStatusSchema),
  jobController.updateJobStatus
);
router.get(
  "/:id/applications",
  authorize("ADMIN"),
  validateQuery(listApplicationsQuerySchema),
  jobController.listApplications
);
router.patch(
  "/applications/:applicationId/status",
  authorize("ADMIN"),
  validateBody(updateApplicationStatusSchema),
  jobController.updateApplicationStatus
);

export default router;
