import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { uploadSingleFile } from "../middleware/upload";
import { uploadLimiter } from "../middleware/rateLimiters";

const router = Router();

router.use(authenticate);

// Any authenticated role can upload — trainers/admins for materials, students for task
// submissions. The resulting URL is only ever attached to a record the caller is already
// authorized to create (enforced by that record's own route), never trusted on its own.
router.post(
  "/",
  authorize("ADMIN", "TRAINER", "STUDENT"),
  uploadLimiter,
  uploadSingleFile,
  uploadController.uploadFile
);

export default router;
