import { Router } from "express";
import * as feeController from "../controllers/fee.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  listFeeStatusQuerySchema,
  listPaymentsQuerySchema,
  recordPaymentSchema,
  updateDiscountSchema,
} from "../validators/fee.validator";

const router = Router();

router.use(authenticate);

// Student-facing — read-only, always scoped to the requester themselves.
router.get("/my-status", authorize("STUDENT"), feeController.getMyFeeStatus);
router.get("/my-payments", authorize("STUDENT"), feeController.getMyPayments);

// Admin fee management.
router.get(
  "/status",
  authorize("ADMIN"),
  validateQuery(listFeeStatusQuerySchema),
  feeController.listFeeStatus
);
router.get(
  "/payments",
  authorize("ADMIN"),
  validateQuery(listPaymentsQuerySchema),
  feeController.listPayments
);
router.post("/payments", authorize("ADMIN"), validateBody(recordPaymentSchema), feeController.recordPayment);
router.get("/payments/:studentId/:batchId", authorize("ADMIN"), feeController.getPaymentHistory);
router.patch(
  "/enrollments/:enrollmentId/discount",
  authorize("ADMIN"),
  validateBody(updateDiscountSchema),
  feeController.updateDiscount
);

export default router;
