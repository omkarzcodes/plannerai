import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { BoardColumn } from "@/features/boards/components/BoardColumn";
import { TaskCard } from "@/features/boards/components/TaskCard";
import { useBoard } from "@/features/boards/hooks";
import { useDeleteTask, useMoveTask } from "@/features/tasks/hooks";
import type { Column, Task } from "@/types";

export default function BoardPage() {
  const { boardId = "" } = useParams();
  const { data: board, isLoading, isError } = useBoard(boardId);

  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const moveTaskMutation = useMoveTask(boardId);
  const deleteTaskMutation = useDeleteTask(boardId);

  // Keep local DnD state in sync with the server data.
  useEffect(() => {
    if (board) setColumns(board.columns);
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function findColumnId(id: string): string | undefined {
    if (columns.some((c) => c.id === id)) return id;
    return columns.find((c) => c.tasks.some((t) => t.id === id))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const task =
      columns.flatMap((c) => c.tasks).find((t) => t.id === id) ?? null;
    setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromColId = findColumnId(activeId);
    const toColId = findColumnId(overId);
    if (!fromColId || !toColId) return;

    const fromCol = columns.find((c) => c.id === fromColId)!;
    const toCol = columns.find((c) => c.id === toColId)!;
    const oldIndex = fromCol.tasks.findIndex((t) => t.id === activeId);
    if (oldIndex === -1) return;

    // Where in the target column are we dropping?
    const overIsColumn = toCol.id === overId;
    const overIndex = toCol.tasks.findIndex((t) => t.id === overId);
    const rawIndex =
      overIsColumn || overIndex === -1 ? toCol.tasks.length : overIndex;

    if (fromColId === toColId) {
      const targetIndex = Math.min(rawIndex, toCol.tasks.length - 1);
      if (oldIndex === targetIndex) return;
      setColumns((prev) =>
        prev.map((c) =>
          c.id === toColId
            ? { ...c, tasks: arrayMove(c.tasks, oldIndex, targetIndex) }
            : c,
        ),
      );
      moveTaskMutation.mutate({
        taskId: activeId,
        columnId: toColId,
        position: targetIndex,
      });
    } else {
      const movedTask: Task = { ...fromCol.tasks[oldIndex], columnId: toColId };
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id === fromColId)
            return { ...c, tasks: c.tasks.filter((t) => t.id !== activeId) };
          if (c.id === toColId) {
            const next = [...c.tasks];
            next.splice(rawIndex, 0, movedTask);
            return { ...c, tasks: next };
          }
          return c;
        }),
      );
      moveTaskMutation.mutate({
        taskId: activeId,
        columnId: toColId,
        position: rawIndex,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (isError || !board) {
    return <p className="text-sm text-red-600">Could not load this board.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{board.title}</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              boardId={boardId}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
