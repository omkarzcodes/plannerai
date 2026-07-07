export const POMODORO = {
  FOCUS: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
  longBreakEvery: 4,
} as const;

export type PomodoroMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

export const MODE_MINUTES: Record<PomodoroMode, number> = {
  FOCUS: POMODORO.FOCUS,
  SHORT_BREAK: POMODORO.SHORT_BREAK,
  LONG_BREAK: POMODORO.LONG_BREAK,
};
