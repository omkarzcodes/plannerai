import type { Request, Response } from "express";
import { param } from "../../lib/validation.js";
import * as columnService from "./column.service.js";
import type {
  CreateColumnInput,
  ReorderColumnsInput,
  UpdateColumnInput,
} from "./column.schemas.js";

export async function create(req: Request, res: Response) {
  const column = await columnService.createColumn(
    req.user!.id,
    param(req, "boardId"),
    req.body as CreateColumnInput,
  );
  res.status(201).json({ column });
}

export async function update(req: Request, res: Response) {
  const column = await columnService.updateColumn(
    req.user!.id,
    param(req, "columnId"),
    req.body as UpdateColumnInput,
  );
  res.status(200).json({ column });
}

export async function remove(req: Request, res: Response) {
  await columnService.deleteColumn(req.user!.id, param(req, "columnId"));
  res.status(204).send();
}

export async function reorder(req: Request, res: Response) {
  const columns = await columnService.reorderColumns(
    req.user!.id,
    param(req, "boardId"),
    req.body as ReorderColumnsInput,
  );
  res.status(200).json({ columns });
}
