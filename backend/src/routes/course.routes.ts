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

// A trainer's "My Courses" — courses they're assigned to teach via at least one batch.
router.get("/trainer", authenticate, authorize("TRAINER"), courseController.listTrainerCourses);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateBody(createCourseSchema),
  courseController.createCourse
);
router.get("/:id", authenticate, authorize("ADMIN", "TRAINER"), courseController.getCourse);
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

// Curriculum (modules) nested under their course. Trainers get full read+author access
// scoped to courses they're assigned to teach (assertCourseContentAccess, checked inside
// the service); admins can author any course's curriculum.
router.get(
  "/:courseId/modules",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  moduleController.listModules
);
router.post(
  "/:courseId/modules",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  validateBody(createModuleSchema),
  moduleController.createModule
);
router.patch(
  "/:courseId/modules/reorder",
  authenticate,
  authorize("ADMIN", "TRAINER"),
  validateBody(reorderModulesSchema),
  moduleController.reorderModules
);

export default router;
