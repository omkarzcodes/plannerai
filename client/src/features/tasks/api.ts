import { api } from "@/lib/api";
import type { Priority, Task } from "@/types";

export interface CreateTaskInput {
  columnId: string;
  title: string;
  priority?: Priority;
}

export async function createTask({
  columnId,
  ...body
}: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<{ task: Task }>(
    `/columns/${columnId}/tasks`,
    body,
  );
  return data.task;
}

export interface UpdateTaskInput {
  taskId: string;
  completed?: boolean;
  title?: string;
  priority?: Priority;
}

export async function updateTask({
  taskId,
  ...body
}: UpdateTaskInput): Promise<Task> {
  const { data } = await api.patch<{ task: Task }>(`/tasks/${taskId}`, body);
  return data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}

export interface MoveTaskInput {
  taskId: string;
  columnId: string;
  position: number;
}

// NOTE: the backend expects { toColumnId, toIndex } — this was the persistence bug.
export async function moveTask({
  taskId,
  columnId,
  position,
}: MoveTaskInput): Promise<void> {
  await api.patch(`/tasks/${taskId}/move`, {
    toColumnId: columnId,
    toIndex: position,
  });
}
