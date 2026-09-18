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

router.use(authenticate, authorize("ADMIN"));

router.get("/status", validateQuery(listFeeStatusQuerySchema), feeController.listFeeStatus);
router.get("/payments", validateQuery(listPaymentsQuerySchema), feeController.listPayments);
router.post("/payments", validateBody(recordPaymentSchema), feeController.recordPayment);
router.get("/payments/:studentId/:batchId", feeController.getPaymentHistory);
router.patch(
  "/enrollments/:enrollmentId/discount",
  validateBody(updateDiscountSchema),
  feeController.updateDiscount
);

export default router;
