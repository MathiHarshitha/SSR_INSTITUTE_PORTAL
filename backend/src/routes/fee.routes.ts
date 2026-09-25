import { Router } from "express";
import * as feeController from "../controllers/fee.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import { uploadSingleImage } from "../middleware/upload";
import {
  approvePaymentRequestSchema,
  listFeeStatusQuerySchema,
  listPaymentRequestsQuerySchema,
  listPaymentsQuerySchema,
  paymentRequestIdParamsSchema,
  recordPaymentSchema,
  rejectPaymentRequestSchema,
  submitPaymentRequestSchema,
  updateDiscountSchema,
} from "../validators/fee.validator";

const router = Router();

router.use(authenticate);

// Student-facing — read-only, always scoped to the requester themselves.
router.get("/my-status", authorize("STUDENT"), feeController.getMyFeeStatus);
router.get("/my-payments", authorize("STUDENT"), feeController.getMyPayments);
router.get("/my-payment-requests", authorize("STUDENT"), feeController.getMyPaymentRequests);

// Student screenshot submission. authorize runs before multer so unauthenticated/unauthorized
// callers never get a file buffered; the service derives student, fee, and balance from the DB.
router.post(
  "/payment-requests",
  authorize("STUDENT"),
  uploadSingleImage("screenshot"),
  validateBody(submitPaymentRequestSchema),
  feeController.submitPaymentRequest
);

// Payment QR code — readable by students (to pay) and admins; replaceable by admins only.
router.get("/payment-settings", authorize("STUDENT", "ADMIN"), feeController.getPaymentSettings);
router.get("/payment-settings/qr-code", authorize("STUDENT", "ADMIN"), feeController.getPaymentQrCode);
router.put(
  "/payment-settings/qr-code",
  authorize("ADMIN"),
  uploadSingleImage("qrCode"),
  feeController.replacePaymentQrCode
);
router.delete("/payment-settings/qr-code", authorize("ADMIN"), feeController.removePaymentQrCode);

// Screenshot image — admins any; students only their own (enforced in the service).
router.get(
  "/payment-requests/:id/screenshot",
  authorize("STUDENT", "ADMIN"),
  validateParams(paymentRequestIdParamsSchema),
  feeController.getPaymentRequestScreenshot
);

// Admin payment verification.
router.get(
  "/payment-requests",
  authorize("ADMIN"),
  validateQuery(listPaymentRequestsQuerySchema),
  feeController.listPaymentRequests
);
router.get(
  "/payment-requests/:id",
  authorize("ADMIN"),
  validateParams(paymentRequestIdParamsSchema),
  feeController.getPaymentRequest
);
router.patch(
  "/payment-requests/:id/approve",
  authorize("ADMIN"),
  validateParams(paymentRequestIdParamsSchema),
  validateBody(approvePaymentRequestSchema),
  feeController.approvePaymentRequest
);
router.patch(
  "/payment-requests/:id/reject",
  authorize("ADMIN"),
  validateParams(paymentRequestIdParamsSchema),
  validateBody(rejectPaymentRequestSchema),
  feeController.rejectPaymentRequest
);

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
