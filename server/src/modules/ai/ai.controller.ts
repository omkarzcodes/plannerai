import type { Request, Response } from "express";
import * as aiService from "./ai.service.js";
import type { BreakdownInput } from "./ai.schemas.js";

export async function breakdown(req: Request, res: Response) {
  const result = await aiService.breakdownTask(req.body as BreakdownInput);
  res.status(200).json(result);
}

export async function schedule(req: Request, res: Response) {
  const result = await aiService.suggestSchedule(req.user!.id);
  res.status(200).json(result);
}

export async function insights(req: Request, res: Response) {
  const result = await aiService.generateInsights(req.user!.id);
  res.status(200).json(result);
}
