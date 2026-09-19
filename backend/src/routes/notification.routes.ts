import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";
import { validateQuery } from "../middleware/validate";
import { listNotificationsQuerySchema } from "../validators/notification.validator";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listNotificationsQuerySchema), notificationController.listNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
