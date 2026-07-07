import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { columnIdParams, taskIdParams } from "../../lib/validation.js";
import * as taskController from "./task.controller.js";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "./task.schemas.js";

const router = Router();
router.use(authenticate);

router.post(
  "/columns/:columnId/tasks",
  validate({ params: columnIdParams, body: createTaskSchema }),
  taskController.create,
);
router.get(
  "/tasks/:taskId",
  validate({ params: taskIdParams }),
  taskController.getOne,
);
router.patch(
  "/tasks/:taskId",
  validate({ params: taskIdParams, body: updateTaskSchema }),
  taskController.update,
);
router.patch(
  "/tasks/:taskId/move",
  validate({ params: taskIdParams, body: moveTaskSchema }),
  taskController.move,
);
router.delete(
  "/tasks/:taskId",
  validate({ params: taskIdParams }),
  taskController.remove,
);

export default router;
