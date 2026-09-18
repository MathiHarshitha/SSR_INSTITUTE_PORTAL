import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "../validators/task.validator";
import { z } from "zod";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "TRAINER", "STUDENT"),
  validateQuery(listTasksQuerySchema),
  taskController.listTasks
);
router.post("/", authorize("ADMIN", "TRAINER"), validateBody(createTaskSchema), taskController.createTask);
router.get("/:id", authorize("ADMIN", "TRAINER", "STUDENT"), taskController.getTask);
router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateTaskSchema),
  taskController.updateTask
);
router.patch(
  "/:id/status",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateTaskStatusSchema),
  taskController.updateTaskStatus
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), taskController.deleteTask);

router.get("/:taskId/submissions", authorize("ADMIN", "TRAINER"), taskController.listSubmissions);

router.get("/:taskId/my-submission", authorize("STUDENT"), taskController.getMySubmission);
router.post(
  "/:taskId/submit",
  authorize("STUDENT"),
  validateBody(
    z.object({
      content: z.string().trim().max(10000).optional(),
      fileUrl: z.string().trim().url().optional(),
      comments: z.string().trim().max(2000).optional(),
    })
  ),
  taskController.submitTask
);

export default router;
