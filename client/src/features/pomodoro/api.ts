import { api } from "@/lib/api";
import type { PomodoroMode } from "./config";

export interface LogSessionInput {
  type: PomodoroMode;
  duration: number; // minutes
  taskId?: string;
}

export interface PomodoroSession {
  id: string;
  type: PomodoroMode;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  completed: boolean;
}

export async function logSession(
  input: LogSessionInput,
): Promise<PomodoroSession> {
  const { data } = await api.post<{ session: PomodoroSession }>(
    "/pomodoro/sessions",
    input,
  );
  return data.session;
}

export async function listTodaySessions(): Promise<PomodoroSession[]> {
  const { data } = await api.get<{ sessions: PomodoroSession[] }>(
    "/pomodoro/sessions",
  );
  return data.sessions;
}
