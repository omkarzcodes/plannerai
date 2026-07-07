import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { boardIdParams } from "../../lib/validation.js";
import * as boardController from "./board.controller.js";
import { createBoardSchema, updateBoardSchema } from "./board.schemas.js";

const router = Router();
router.use(authenticate);

router.get("/boards", boardController.list);
router.post(
  "/boards",
  validate({ body: createBoardSchema }),
  boardController.create,
);
router.get(
  "/boards/:boardId",
  validate({ params: boardIdParams }),
  boardController.getOne,
);
router.patch(
  "/boards/:boardId",
  validate({ params: boardIdParams, body: updateBoardSchema }),
  boardController.update,
);
router.delete(
  "/boards/:boardId",
  validate({ params: boardIdParams }),
  boardController.remove,
);

export default router;
