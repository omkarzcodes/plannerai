import { prisma } from "../../lib/prisma.js";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getOverview(userId: string) {
  const days = lastNDays(7);
  const since = new Date(`${days[0]}T00:00:00.000Z`);

  const [
    completedTasks,
    focusSessions,
    byPriority,
    completedCount,
    pendingCount,
  ] = await Promise.all([
    prisma.task.findMany({
      where: { userId, completed: true, completedAt: { gte: since } },
      select: { completedAt: true },
    }),
    prisma.pomodoroSession.findMany({
      where: { userId, type: "FOCUS", startedAt: { gte: since } },
      select: { startedAt: true, duration: true },
    }),
    prisma.task.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.task.count({ where: { userId, completed: true } }),
    prisma.task.count({ where: { userId, completed: false } }),
  ]);

  const completedMap = new Map(days.map((d) => [d, 0]));
  for (const t of completedTasks) {
    if (!t.completedAt) continue;
    const key = dayKey(t.completedAt);
    if (completedMap.has(key))
      completedMap.set(key, completedMap.get(key)! + 1);
  }

  const focusMap = new Map(days.map((d) => [d, 0]));
  for (const s of focusSessions) {
    const key = dayKey(s.startedAt);
    if (focusMap.has(key)) focusMap.set(key, focusMap.get(key)! + s.duration);
  }

  const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const priorityCounts = new Map<Priority, number>(
    priorities.map((p) => [p, 0]),
  );
  for (const row of byPriority) {
    priorityCounts.set(row.priority as Priority, row._count._all);
  }

  return {
    tasksCompletedPerDay: days.map((date) => ({
      date,
      count: completedMap.get(date)!,
    })),
    focusMinutesPerDay: days.map((date) => ({
      date,
      minutes: focusMap.get(date)!,
    })),
    tasksByPriority: priorities.map((priority) => ({
      priority,
      count: priorityCounts.get(priority)!,
    })),
    taskStatus: { completed: completedCount, pending: pendingCount },
  };
}
