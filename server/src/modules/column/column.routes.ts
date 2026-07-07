import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { boardIdParams, columnIdParams } from "../../lib/validation.js";
import * as columnController from "./column.controller.js";
import {
  createColumnSchema,
  reorderColumnsSchema,
  updateColumnSchema,
} from "./column.schemas.js";

const router = Router();
router.use(authenticate);

router.post(
  "/boards/:boardId/columns",
  validate({ params: boardIdParams, body: createColumnSchema }),
  columnController.create,
);
router.patch(
  "/boards/:boardId/columns/reorder",
  validate({ params: boardIdParams, body: reorderColumnsSchema }),
  columnController.reorder,
);
router.patch(
  "/columns/:columnId",
  validate({ params: columnIdParams, body: updateColumnSchema }),
  columnController.update,
);
router.delete(
  "/columns/:columnId",
  validate({ params: columnIdParams }),
  columnController.remove,
);

export default router;
