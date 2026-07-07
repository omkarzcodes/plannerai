import { z } from "zod";

export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
});

export const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().min(1)).min(1),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
