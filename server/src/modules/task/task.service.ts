import { NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "./task.schemas.js";

async function ensureColumnOwner(userId: string, columnId: string) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
    select: { id: true, title: true },
  });
  if (!column) throw new NotFoundError("Column not found");
  return column;
}

async function ensureTaskOwner(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new NotFoundError("Task not found");
  return task;
}

// A task is "completed" when it lives in a column titled "Done".
function isDoneColumn(title: string) {
  return title.trim().toLowerCase() === "done";
}

export async function createTask(
  userId: string,
  columnId: string,
  input: CreateTaskInput,
) {
  const column = await ensureColumnOwner(userId, columnId);
  const count = await prisma.task.count({ where: { columnId } });
  const done = isDoneColumn(column.title);
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ?? null,
      columnId,
      userId,
      position: count,
      completed: done,
      completedAt: done ? new Date() : null,
    },
  });
}

export async function getTask(userId: string, taskId: string) {
  return ensureTaskOwner(userId, taskId);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  await ensureTaskOwner(userId, taskId);
  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.completed !== undefined && {
        completed: input.completed,
        completedAt: input.completed ? new Date() : null,
      }),
    },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await ensureTaskOwner(userId, taskId);
  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: task.id } });
    // close the gap left in the source column
    await tx.task.updateMany({
      where: { columnId: task.columnId, position: { gt: task.position } },
      data: { position: { decrement: 1 } },
    });
  });
}

export async function moveTask(
  userId: string,
  taskId: string,
  input: MoveTaskInput,
) {
  const task = await ensureTaskOwner(userId, taskId);
  const destColumn = await ensureColumnOwner(userId, input.toColumnId);
  const done = isDoneColumn(destColumn.title);

  await prisma.$transaction(async (tx) => {
    const sameColumn = task.columnId === input.toColumnId;
    const destCount = await tx.task.count({
      where: { columnId: input.toColumnId },
    });
    // clamp target index to a valid range
    const maxIndex = sameColumn ? destCount - 1 : destCount;
    const toIndex = Math.min(input.toIndex, Math.max(maxIndex, 0));

    if (sameColumn) {
      if (toIndex === task.position) return;

      if (toIndex > task.position) {
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            position: { gt: task.position, lte: toIndex },
          },
          data: { position: { decrement: 1 } },
        });
      } else {
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            position: { gte: toIndex, lt: task.position },
          },
          data: { position: { increment: 1 } },
        });
      }

      await tx.task.update({
        where: { id: task.id },
        data: { position: toIndex },
      });
    } else {
      // 1) close the gap in the source column
      await tx.task.updateMany({
        where: { columnId: task.columnId, position: { gt: task.position } },
        data: { position: { decrement: 1 } },
      });
      // 2) make room in the destination column
      await tx.task.updateMany({
        where: { columnId: input.toColumnId, position: { gte: toIndex } },
        data: { position: { increment: 1 } },
      });
      // 3) move the task AND sync its completion to the destination column
      await tx.task.update({
        where: { id: task.id },
        data: {
          columnId: input.toColumnId,
          position: toIndex,
          completed: done,
          completedAt: done ? new Date() : null,
        },
      });
    }
  });

  return prisma.task.findUnique({ where: { id: taskId } });
}
