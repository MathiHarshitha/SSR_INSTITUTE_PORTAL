import { Router } from "express";
import * as batchController from "../controllers/batch.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createBatchSchema,
  enrollStudentSchema,
  listBatchesQuerySchema,
  updateBatchSchema,
  updateBatchStatusSchema,
} from "../validators/batch.validator";

const router = Router();

router.use(authenticate);

// Read access: admins see everything, trainers see only their own assigned batches
// (enforced in the service layer, not just here — never trust the client's role alone).
router.get(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateQuery(listBatchesQuerySchema),
  batchController.listBatches
);
router.get("/:id", authorize("ADMIN", "TRAINER"), batchController.getBatch);
router.get("/:id/students", authorize("ADMIN", "TRAINER"), batchController.listBatchStudents);

// Mutations (create/edit/enrollment) stay admin-only.
router.post("/", authorize("ADMIN"), validateBody(createBatchSchema), batchController.createBatch);
router.patch("/:id", authorize("ADMIN"), validateBody(updateBatchSchema), batchController.updateBatch);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validateBody(updateBatchStatusSchema),
  batchController.updateBatchStatus
);
router.post(
  "/:id/students",
  authorize("ADMIN"),
  validateBody(enrollStudentSchema),
  batchController.enrollStudent
);
router.delete("/:id/students/:studentId", authorize("ADMIN"), batchController.removeStudent);

export default router;
