import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
router.post("/login", validate({ body: loginSchema }), authController.login);
router.post(
  "/refresh",
  validate({ body: refreshSchema }),
  authController.refresh,
);
router.get("/me", authenticate, authController.me);

export default router;
