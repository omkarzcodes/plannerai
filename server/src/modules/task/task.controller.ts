import type { Request, Response } from "express";
import { param } from "../../lib/validation.js";
import * as taskService from "./task.service.js";
import type {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "./task.schemas.js";

export async function create(req: Request, res: Response) {
  const task = await taskService.createTask(
    req.user!.id,
    param(req, "columnId"),
    req.body as CreateTaskInput,
  );
  res.status(201).json({ task });
}

export async function getOne(req: Request, res: Response) {
  const task = await taskService.getTask(req.user!.id, param(req, "taskId"));
  res.status(200).json({ task });
}

export async function update(req: Request, res: Response) {
  const task = await taskService.updateTask(
    req.user!.id,
    param(req, "taskId"),
    req.body as UpdateTaskInput,
  );
  res.status(200).json({ task });
}

export async function move(req: Request, res: Response) {
  const task = await taskService.moveTask(
    req.user!.id,
    param(req, "taskId"),
    req.body as MoveTaskInput,
  );
  res.status(200).json({ task });
}

export async function remove(req: Request, res: Response) {
  await taskService.deleteTask(req.user!.id, param(req, "taskId"));
  res.status(204).send();
}
