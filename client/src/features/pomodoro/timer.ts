import { useCallback, useEffect, useRef, useState } from "react";
import { MODE_MINUTES, POMODORO, type PomodoroMode } from "./config";

type Durations = Record<PomodoroMode, number>;

const INITIAL_DURATIONS: Durations = {
  FOCUS: MODE_MINUTES.FOCUS * 60,
  SHORT_BREAK: MODE_MINUTES.SHORT_BREAK * 60,
  LONG_BREAK: MODE_MINUTES.LONG_BREAK * 60,
};

interface UsePomodoroOptions {
  onComplete?: (finished: PomodoroMode, durationMinutes: number) => void;
}

export function usePomodoro({ onComplete }: UsePomodoroOptions = {}) {
  const [durations, setDurations] = useState<Durations>(INITIAL_DURATIONS);
  const [mode, setMode] = useState<PomodoroMode>("FOCUS");
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_DURATIONS.FOCUS);
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Always read the latest durations without re-seeding the interval.
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  const complete = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;

    const finished = mode;
    const finishedMinutes = Math.round(durationsRef.current[finished] / 60);
    onCompleteRef.current?.(finished, finishedMinutes);

    if (finished === "FOCUS") {
      const nextCount = focusCount + 1;
      setFocusCount(nextCount);
      const next: PomodoroMode =
        nextCount % POMODORO.longBreakEvery === 0
          ? "LONG_BREAK"
          : "SHORT_BREAK";
      setMode(next);
      setSecondsLeft(durationsRef.current[next]);
    } else {
      setMode("FOCUS");
      setSecondsLeft(durationsRef.current.FOCUS);
    }
  }, [mode, focusCount]);

  useEffect(() => {
    if (!isRunning) return;

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
    }

    const id = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current! - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        complete();
      }
    }, 250);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, complete]);

  const start = useCallback(() => {
    if (secondsLeft <= 0) return;
    setIsRunning(true);
  }, [secondsLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (endTimeRef.current !== null) {
      const remaining = Math.max(
        0,
        Math.round((endTimeRef.current - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      endTimeRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    endTimeRef.current = null;
    setSecondsLeft(durationsRef.current[mode]);
  }, [mode]);

  const switchMode = useCallback((next: PomodoroMode) => {
    setMode(next);
    setSecondsLeft(durationsRef.current[next]);
    setIsRunning(false);
    endTimeRef.current = null;
  }, []);

  const skip = useCallback(() => {
    switchMode(mode === "FOCUS" ? "SHORT_BREAK" : "FOCUS");
  }, [mode, switchMode]);

  // Set a custom duration (in minutes) for the CURRENT mode.
  const setCustomMinutes = useCallback(
    (minutes: number) => {
      const safe = Math.min(180, Math.max(1, Math.round(minutes)));
      const secs = safe * 60;
      setDurations((d) => ({ ...d, [mode]: secs }));
      setIsRunning(false);
      endTimeRef.current = null;
      setSecondsLeft(secs);
    },
    [mode],
  );

  return {
    mode,
    secondsLeft,
    isRunning,
    focusCount,
    durationSeconds: durations[mode],
    start,
    pause,
    reset,
    skip,
    switchMode,
    setCustomMinutes,
  };
}
