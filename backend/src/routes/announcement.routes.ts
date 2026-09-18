import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createAnnouncementSchema,
  listAnnouncementsQuerySchema,
} from "../validators/announcement.validator";

const router = Router();

// Any authenticated user can read announcements addressed to them; only admins can author them.
router.get("/", authenticate, validateQuery(listAnnouncementsQuerySchema), announcementController.listAnnouncements);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateBody(createAnnouncementSchema),
  announcementController.createAnnouncement
);
router.delete("/:id", authenticate, authorize("ADMIN"), announcementController.deleteAnnouncement);

export default router;
