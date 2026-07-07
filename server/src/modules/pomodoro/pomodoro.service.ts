import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";

type PomodoroType = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

interface LogSessionParams {
  userId: string;
  type: PomodoroType;
  duration: number; // minutes
  taskId?: string;
}

export async function logSession({
  userId,
  type,
  duration,
  taskId,
}: LogSessionParams) {
  if (taskId) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundError("Task not found");
  }

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - duration * 60_000);

  return prisma.pomodoroSession.create({
    data: {
      userId,
      type,
      duration,
      startedAt,
      endedAt,
      completed: true,
      taskId: taskId ?? null,
    },
  });
}

export async function listTodaySessions(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return prisma.pomodoroSession.findMany({
    where: { userId, startedAt: { gte: start } },
    orderBy: { startedAt: "desc" },
  });
}
