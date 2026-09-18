import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import * as moduleController from "../controllers/module.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createCourseSchema,
  listCoursesQuerySchema,
  updateCourseSchema,
  updateCourseStatusSchema,
} from "../validators/course.validator";
import { createModuleSchema, reorderModulesSchema } from "../validators/module.validator";

const router = Router();

// Public — needed by the registration form's course picker, before the user has an account.
router.get("/", courseController.listPublicCourses);

// Admin course management.
router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  validateQuery(listCoursesQuerySchema),
  courseController.listAdminCourses
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateBody(createCourseSchema),
  courseController.createCourse
);
router.get("/:id", authenticate, authorize("ADMIN"), courseController.getCourse);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateBody(updateCourseSchema),
  courseController.updateCourse
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validateBody(updateCourseStatusSchema),
  courseController.updateCourseStatus
);

// Curriculum (modules) nested under their course.
router.get("/:courseId/modules", authenticate, authorize("ADMIN"), moduleController.listModules);
router.post(
  "/:courseId/modules",
  authenticate,
  authorize("ADMIN"),
  validateBody(createModuleSchema),
  moduleController.createModule
);
router.patch(
  "/:courseId/modules/reorder",
  authenticate,
  authorize("ADMIN"),
  validateBody(reorderModulesSchema),
  moduleController.reorderModules
);

export default router;
