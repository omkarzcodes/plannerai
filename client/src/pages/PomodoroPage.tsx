import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { type PomodoroMode } from "@/features/pomodoro/config";
import { useLogSession, useTodaySessions } from "@/features/pomodoro/hooks";
import { usePomodoro } from "@/features/pomodoro/timer";

const MODE_LABEL: Record<PomodoroMode, string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short break",
  LONG_BREAK: "Long break",
};

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroPage() {
  const logSession = useLogSession();
  const { data: sessions } = useTodaySessions();
  const [customMinutes, setCustomMinutes] = useState("");

  const timer = usePomodoro({
    onComplete: (finished, durationMinutes) => {
      if (finished === "FOCUS") {
        logSession.mutate({ type: "FOCUS", duration: durationMinutes });
      }
    },
  });

  const totalSeconds = timer.durationSeconds;
  const progress =
    totalSeconds === 0
      ? 0
      : ((totalSeconds - timer.secondsLeft) / totalSeconds) * 100;

  const focusToday = useMemo(() => {
    const focus = (sessions ?? []).filter((s) => s.type === "FOCUS");
    return {
      count: focus.length,
      minutes: focus.reduce((sum, s) => sum + s.duration, 0),
    };
  }, [sessions]);

  function applyCustom(e: FormEvent) {
    e.preventDefault();
    const value = Number(customMinutes);
    if (!Number.isFinite(value) || value <= 0) return;
    timer.setCustomMinutes(value);
    setCustomMinutes("");
  }

  const secondaryBtn =
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Focus timer</h1>

      <div className="flex gap-2">
        {(Object.keys(MODE_LABEL) as PomodoroMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => timer.switchMode(m)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              timer.mode === m
                ? "bg-brand-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
            )}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <span className="font-mono text-6xl font-semibold tabular-nums">
            {formatTime(timer.secondsLeft)}
          </span>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex gap-2">
            {timer.isRunning ? (
              <Button onClick={timer.pause}>Pause</Button>
            ) : (
              <Button onClick={timer.start} disabled={timer.secondsLeft <= 0}>
                Start
              </Button>
            )}
            <Button className={secondaryBtn} onClick={timer.reset}>
              Reset
            </Button>
            <Button className={secondaryBtn} onClick={timer.skip}>
              Skip
            </Button>
          </div>

          <form
            onSubmit={applyCustom}
            className="flex w-full items-center justify-center gap-2"
          >
            <Input
              type="number"
              min={1}
              max={180}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder={`Custom ${MODE_LABEL[timer.mode].toLowerCase()} minutes`}
              className="h-9 w-52 text-sm"
            />
            <Button type="submit" className={secondaryBtn}>
              Set
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex justify-around py-6 text-center">
          <div>
            <p className="text-2xl font-semibold">{focusToday.count}</p>
            <p className="text-xs text-neutral-500">Focus sessions today</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{focusToday.minutes}</p>
            <p className="text-xs text-neutral-500">Minutes focused</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
