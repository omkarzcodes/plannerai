import { Type, type Schema } from "@google/genai";
import { generateStructured } from "../../lib/gemini.js";
import { prisma } from "../../lib/prisma.js";
import type { BreakdownInput } from "./ai.schemas.js";

/* ----------------------------- Task breakdown ----------------------------- */

type BreakdownResult = {
  subtasks: Array<{ title: string; estimatedMinutes: number }>;
};

const breakdownResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    subtasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          estimatedMinutes: { type: Type.INTEGER },
        },
        required: ["title", "estimatedMinutes"],
      },
    },
  },
  required: ["subtasks"],
};

export async function breakdownTask(
  input: BreakdownInput,
): Promise<BreakdownResult> {
  const prompt = [
    "Break this task into a short, ordered list of concrete, actionable subtasks.",
    `Task title: ${input.title}`,
    input.description ? `Task details: ${input.description}` : "",
    "Return between 3 and 8 subtasks. Keep each title concise and give a realistic time estimate in minutes.",
  ]
    .filter(Boolean)
    .join("\n");

  return generateStructured<BreakdownResult>({
    prompt,
    schema: breakdownResponseSchema,
    systemInstruction:
      "You are a productivity assistant that breaks tasks into clear, practical steps.",
  });
}

/* ----------------------------- Smart schedule ----------------------------- */

type ScheduleResult = {
  summary: string;
  blocks: Array<{
    taskTitle: string;
    suggestedStart: string;
    durationMinutes: number;
    reason: string;
  }>;
};

const scheduleResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    blocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskTitle: { type: Type.STRING },
          suggestedStart: { type: Type.STRING },
          durationMinutes: { type: Type.INTEGER },
          reason: { type: Type.STRING },
        },
        required: ["taskTitle", "suggestedStart", "durationMinutes", "reason"],
      },
    },
  },
  required: ["summary", "blocks"],
};

export async function suggestSchedule(userId: string): Promise<ScheduleResult> {
  const tasks = await prisma.task.findMany({
    where: { userId, completed: false },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    take: 20,
    select: { title: true, priority: true, dueDate: true },
  });

  if (tasks.length === 0) {
    return {
      summary:
        "You have no pending tasks — enjoy the free time or plan something new!",
      blocks: [],
    };
  }

  const taskLines = tasks
    .map((t, i) => {
      const due = t.dueDate
        ? `, due: ${t.dueDate.toISOString().slice(0, 10)}`
        : "";
      return `${i + 1}. ${t.title} — priority: ${t.priority}${due}`;
    })
    .join("\n");

  const prompt = [
    "Create a focused, realistic work schedule for today from these pending tasks.",
    "Assume an 8-hour workday starting at 09:00 with short breaks.",
    "Prioritize by urgency (due date) and importance (priority).",
    "Tasks:",
    taskLines,
    "Return time blocks with a suggested start time (HH:MM), a duration in minutes, and a one-line reason each, plus a short overall summary.",
  ].join("\n");

  return generateStructured<ScheduleResult>({
    prompt,
    schema: scheduleResponseSchema,
    systemInstruction:
      "You are a scheduling assistant that produces practical, time-boxed daily plans.",
  });
}

/* --------------------------- Productivity insights ------------------------ */

type InsightsResult = {
  summary: string;
  insights: string[];
  recommendations: string[];
};

const insightsResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "insights", "recommendations"],
};

export async function generateInsights(
  userId: string,
): Promise<InsightsResult> {
  const now = new Date();

  const [
    totalTasks,
    completedTasks,
    overdueTasks,
    tasksByPriority,
    focusSessions,
    focusAgg,
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, completed: true } }),
    prisma.task.count({
      where: { userId, completed: false, dueDate: { lt: now } },
    }),
    prisma.task.groupBy({
      by: ["priority"],
      where: { userId, completed: false },
      _count: { _all: true },
    }),
    prisma.pomodoroSession.count({
      where: { userId, type: "FOCUS", completed: true },
    }),
    prisma.pomodoroSession.aggregate({
      where: { userId, type: "FOCUS", completed: true },
      _sum: { duration: true },
    }),
  ]);

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const focusMinutes = focusAgg._sum.duration ?? 0; // PomodoroSession.duration is stored in minutes
  const priorityBreakdown =
    tasksByPriority.map((p) => `${p.priority}: ${p._count._all}`).join(", ") ||
    "none";

  const prompt = [
    "Analyze this user's productivity data and give encouraging, specific, actionable feedback.",
    `Total tasks: ${totalTasks}`,
    `Completed tasks: ${completedTasks} (${completionRate}% completion rate)`,
    `Overdue pending tasks: ${overdueTasks}`,
    `Pending tasks by priority: ${priorityBreakdown}`,
    `Completed focus sessions: ${focusSessions}`,
    `Total focus time: ${focusMinutes} minutes`,
    "Return a short summary, 2-4 insights, and 2-4 concrete recommendations.",
  ].join("\n");

  return generateStructured<InsightsResult>({
    prompt,
    schema: insightsResponseSchema,
    systemInstruction:
      "You are a supportive productivity coach. Be concise, specific, and positive.",
  });
}
