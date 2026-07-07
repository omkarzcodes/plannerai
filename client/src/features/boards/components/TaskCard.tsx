import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Priority, Task } from "@/types";

const priorityVariant: Record<
  Priority,
  "neutral" | "brand" | "warning" | "danger"
> = {
  LOW: "neutral",
  MEDIUM: "brand",
  HIGH: "warning",
  URGENT: "danger",
};

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  dragging?: boolean;
}

export function TaskCard({ task, onDelete, dragging }: TaskCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800",
        dragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-sm font-medium",
            task.completed && "text-neutral-400 line-through",
          )}
        >
          {task.title}
        </p>
        <Badge variant={priorityVariant[task.priority]}>
          {task.priority.toLowerCase()}
        </Badge>
      </div>

      {onDelete && (
        <div className="mt-2 flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={onDelete}
            className="text-neutral-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
