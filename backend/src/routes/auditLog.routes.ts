import { Router } from "express";
import * as auditLogController from "../controllers/auditLog.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateQuery } from "../middleware/validate";
import { listAuditLogsQuerySchema } from "../validators/auditLog.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateQuery(listAuditLogsQuerySchema),
  auditLogController.listAuditLogs
);

export default router;
