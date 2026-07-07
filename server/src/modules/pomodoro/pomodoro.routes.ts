import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./pomodoro.controller.js";
import { logSessionBody } from "./pomodoro.schemas.js";

const router = Router();

router.use(authenticate);
router.post(
  "/sessions",
  validate({ body: logSessionBody }),
  controller.logSession,
);
router.get("/sessions", controller.listTodaySessions);

export default router;
