import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import { listUsersQuerySchema, rejectUserSchema, suspendUserSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", validateQuery(listUsersQuerySchema), userController.listUsers);
router.get("/stats", userController.getUserStats);
router.get("/:id", userController.getUser);
router.patch("/:id/approve", userController.approveUser);
router.patch("/:id/reject", validateBody(rejectUserSchema), userController.rejectUser);
router.patch("/:id/block", userController.blockUser);
router.patch("/:id/unblock", userController.unblockUser);
router.patch("/:id/suspend", validateBody(suspendUserSchema), userController.suspendUser);
router.patch("/:id/reactivate", userController.reactivateUser);

export default router;
