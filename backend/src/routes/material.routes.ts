import { Router } from "express";
import * as materialController from "../controllers/material.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateBody, validateQuery } from "../middleware/validate";
import {
  createMaterialSchema,
  listMaterialsQuerySchema,
  updateMaterialSchema,
} from "../validators/material.validator";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "TRAINER", "STUDENT"),
  validateQuery(listMaterialsQuerySchema),
  materialController.listMaterials
);
router.post("/", authorize("ADMIN", "TRAINER"), validateBody(createMaterialSchema), materialController.createMaterial);
router.patch(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateBody(updateMaterialSchema),
  materialController.updateMaterial
);
router.delete("/:id", authorize("ADMIN", "TRAINER"), materialController.deleteMaterial);

export default router;
