import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as aiController from "./ai.controller.js";
import { breakdownSchema } from "./ai.schemas.js";

const router = Router();
router.use(authenticate);

router.post(
  "/breakdown",
  validate({ body: breakdownSchema }),
  aiController.breakdown,
);
router.get("/schedule", aiController.schedule);
router.get("/insights", aiController.insights);

export default router;
