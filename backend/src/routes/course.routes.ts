import { Router } from "express";
import * as courseController from "../controllers/course.controller";

const router = Router();

// Public — needed by the registration form's course picker, before the user has an account.
// Full admin course management (create/edit/archive) lands in a later phase.
router.get("/", courseController.listPublicCourses);

export default router;
