import { Router } from "express";
import * as certificateController from "../controllers/certificate.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  issueCertificateSchema,
  listCertificatesQuerySchema,
  revokeCertificateSchema,
} from "../validators/certificate.validator";

const router = Router();

// Public — an employer or anyone holding a certificate number can verify it without an account.
router.get("/verify/:certificateNumber", certificateController.verifyCertificate);

router.get("/my", authenticate, authorize("STUDENT"), certificateController.listMyCertificates);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateQuery(listCertificatesQuerySchema),
  certificateController.listCertificates
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateBody(issueCertificateSchema),
  certificateController.issueCertificate
);
router.get("/:id", authenticate, authorize("ADMIN"), certificateController.getCertificate);
router.patch(
  "/:id/revoke",
  authenticate,
  authorize("ADMIN"),
  validateBody(revokeCertificateSchema),
  certificateController.revokeCertificate
);

export default router;
