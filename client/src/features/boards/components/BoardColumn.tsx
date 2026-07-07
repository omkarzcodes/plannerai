import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Column } from "@/types";
import { AddTaskForm } from "./AddTaskForm";
import { SortableTaskCard } from "./SortableTaskCard";

interface Props {
  column: Column;
  boardId: string;
  onDeleteTask: (taskId: string) => void;
}

export function BoardColumn({ column, boardId, onDeleteTask }: Props) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });
  const taskIds = column.tasks.map((t) => t.id);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900/60">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="text-xs text-neutral-400">{column.tasks.length}</span>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-2 flex-1 flex-col gap-2">
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </div>
      </SortableContext>

      <AddTaskForm columnId={column.id} boardId={boardId} />
    </div>
  );
}
