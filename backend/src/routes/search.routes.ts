import { Router } from "express";
import * as searchController from "../controllers/search.controller";
import { authenticate } from "../middleware/authenticate";
import { validateQuery } from "../middleware/validate";
import { searchQuerySchema } from "../validators/search.validator";

const router = Router();

router.get("/", authenticate, validateQuery(searchQuerySchema), searchController.search);

export default router;
