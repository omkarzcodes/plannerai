import { z } from "zod";

export const logSessionBody = z.object({
  type: z.enum(["FOCUS", "SHORT_BREAK", "LONG_BREAK"]),
  duration: z.number().int().positive().max(600), // minutes
  taskId: z.string().min(1).optional(),
});
