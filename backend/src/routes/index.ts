import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import batchRoutes from "./batch.routes";
import feeRoutes from "./fee.routes";
import jobRoutes from "./job.routes";
import announcementRoutes from "./announcement.routes";
import auditLogRoutes from "./auditLog.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/batches", batchRoutes);
router.use("/fees", feeRoutes);
router.use("/jobs", jobRoutes);
router.use("/announcements", announcementRoutes);
router.use("/audit-logs", auditLogRoutes);

export default router;
