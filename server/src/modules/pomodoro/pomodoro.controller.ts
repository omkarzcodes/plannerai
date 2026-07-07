import type { Request, Response } from "express";
import * as service from "./pomodoro.service.js";

export async function logSession(req: Request, res: Response) {
  const { type, duration, taskId } = req.body;
  const session = await service.logSession({
    userId: req.user!.id,
    type,
    duration,
    taskId,
  });
  res.status(201).json({ session });
}

export async function listTodaySessions(req: Request, res: Response) {
  const sessions = await service.listTodaySessions(req.user!.id);
  res.json({ sessions });
}
