import type { Request, Response } from "express";
import { param } from "../../lib/validation.js";
import * as boardService from "./board.service.js";
import type { CreateBoardInput, UpdateBoardInput } from "./board.schemas.js";

export async function list(req: Request, res: Response) {
  const boards = await boardService.listBoards(req.user!.id);
  res.status(200).json({ boards });
}

export async function getOne(req: Request, res: Response) {
  const board = await boardService.getBoard(
    req.user!.id,
    param(req, "boardId"),
  );
  res.status(200).json({ board });
}

export async function create(req: Request, res: Response) {
  const board = await boardService.createBoard(
    req.user!.id,
    req.body as CreateBoardInput,
  );
  res.status(201).json({ board });
}

export async function update(req: Request, res: Response) {
  const board = await boardService.updateBoard(
    req.user!.id,
    param(req, "boardId"),
    req.body as UpdateBoardInput,
  );
  res.status(200).json({ board });
}

export async function remove(req: Request, res: Response) {
  await boardService.deleteBoard(req.user!.id, param(req, "boardId"));
  res.status(204).send();
}
