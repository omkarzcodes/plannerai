import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useBoard, useBoards } from "@/features/boards/hooks";
import { useCreateTask } from "@/features/tasks/hooks";
import {
  useBreakdownTask,
  useInsights,
  useSchedule,
} from "@/features/ai/hooks";

type AddState = "idle" | "adding" | "done" | "error";

export default function AssistantPage() {
  const insights = useInsights();
  const schedule = useSchedule();
  const breakdown = useBreakdownTask();
  const [title, setTitle] = useState("");

  const boardsQuery = useBoards();
  const [boardId, setBoardId] = useState("");
  const boardDetail = useBoard(boardId);
  const createTask = useCreateTask(boardId);
  const [addState, setAddState] = useState<AddState>("idle");

  const targetColumn = useMemo(() => {
    const columns = boardDetail.data?.columns ?? [];
    return (
      columns.find((c) => c.title.trim().toLowerCase() === "to do") ??
      columns[0]
    );
  }, [boardDetail.data]);

  function handleBreakdown(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setAddState("idle");
    breakdown.mutate({ title: trimmed });
  }

  async function handleAddToBoard() {
    const subtasks = breakdown.data ?? [];
    if (!boardId || !targetColumn || subtasks.length === 0) return;
    setAddState("adding");
    try {
      for (const subtaskTitle of subtasks) {
        await createTask.mutateAsync({
          columnId: targetColumn.id,
          title: subtaskTitle,
        });
      }
      setAddState("done");
    } catch {
      setAddState("error");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">AI assistant</h1>

      {/* Productivity insights */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Productivity insights</h2>
            <button
              type="button"
              onClick={() => insights.refetch()}
              disabled={insights.isFetching}
              className="text-xs text-neutral-500 hover:text-brand-600 disabled:opacity-50"
            >
              {insights.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {insights.isLoading ? (
            <Spinner />
          ) : insights.isError ? (
            <p className="text-sm text-red-600">
              Couldn't generate insights right now.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                {insights.data?.summary ||
                  "Not enough activity yet to generate insights."}
              </p>
              {insights.data && insights.data.recommendations.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
                  {insights.data.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested schedule */}
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Suggested schedule</h2>
            <button
              type="button"
              onClick={() => schedule.refetch()}
              disabled={schedule.isFetching}
              className="text-xs text-neutral-500 hover:text-brand-600 disabled:opacity-50"
            >
              {schedule.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {schedule.isLoading ? (
            <Spinner />
          ) : schedule.isError ? (
            <p className="text-sm text-red-600">
              Couldn't build a schedule right now.
            </p>
          ) : !schedule.data || schedule.data.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No pending tasks to schedule. Add some tasks first.
            </p>
          ) : (
            <ul className="space-y-3">
              {schedule.data.map((item, i) => (
                <li key={i} className="border-l-2 border-brand-300 pl-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {item.recommendation}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Task breakdown */}
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-sm font-semibold">Break down a task</h2>
          <form onSubmit={handleBreakdown} className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch the marketing website"
            />
            <Button type="submit" disabled={breakdown.isPending}>
              {breakdown.isPending ? "Thinking…" : "Break down"}
            </Button>
          </form>

          {breakdown.isError && (
            <p className="text-sm text-red-600">
              Couldn't break down that task. Try again.
            </p>
          )}

          {breakdown.data && breakdown.data.length > 0 && (
            <div className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700 dark:text-neutral-200">
                {breakdown.data.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                <select
                  value={boardId}
                  onChange={(e) => {
                    setBoardId(e.target.value);
                    setAddState("idle");
                  }}
                  className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="">Select a board…</option>
                  {(boardsQuery.data ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleAddToBoard}
                  disabled={
                    !boardId || !targetColumn || addState === "adding"
                  }
                >
                  {addState === "adding" ? "Adding…" : "Add to board"}
                </Button>

                {boardId && boardDetail.isLoading && <Spinner />}
                {addState === "done" && (
                  <span className="text-xs text-green-600">
                    Added {breakdown.data.length} task(s) to “
                    {targetColumn?.title}”.
                  </span>
                )}
                {addState === "error" && (
                  <span className="text-xs text-red-600">
                    Couldn't add tasks. Try again.
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
