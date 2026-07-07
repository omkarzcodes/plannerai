import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as controller from "./analytics.controller.js";

const router = Router();

router.use(authenticate);
router.get("/overview", controller.getOverview);

export default router;
