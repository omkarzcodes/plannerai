import { z } from "zod";

export const boardIdParams = z.object({ boardId: z.string().min(1) });
export const columnIdParams = z.object({ columnId: z.string().min(1) });
export const taskIdParams = z.object({ taskId: z.string().min(1) });

import type { Request } from "express";

// Safely read a validated route param as a string.
export function param(req: Request, name: string): string {
  const value = req.params[name];
  return (Array.isArray(value) ? value[0] : value) as string;
}
