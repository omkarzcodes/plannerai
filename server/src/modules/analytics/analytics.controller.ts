import type { Request, Response } from "express";
import * as service from "./analytics.service.js";

export async function getOverview(req: Request, res: Response) {
  const overview = await service.getOverview(req.user!.id);
  res.json({ overview });
}
