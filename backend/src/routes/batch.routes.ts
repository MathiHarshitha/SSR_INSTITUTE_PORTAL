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

router.use(authenticate, authorize("ADMIN"));

router.get("/", validateQuery(listBatchesQuerySchema), batchController.listBatches);
router.post("/", validateBody(createBatchSchema), batchController.createBatch);
router.get("/:id", batchController.getBatch);
router.patch("/:id", validateBody(updateBatchSchema), batchController.updateBatch);
router.patch("/:id/status", validateBody(updateBatchStatusSchema), batchController.updateBatchStatus);
router.get("/:id/students", batchController.listBatchStudents);
router.post("/:id/students", validateBody(enrollStudentSchema), batchController.enrollStudent);
router.delete("/:id/students/:studentId", batchController.removeStudent);

export default router;
