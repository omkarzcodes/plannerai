import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { useCreateTask } from "@/features/tasks/hooks";

export function AddTaskForm({
  columnId,
  boardId,
}: {
  columnId: string;
  boardId: string;
}) {
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateTask(boardId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    mutate({ columnId, title: trimmed });
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="+ Add task"
        disabled={isPending}
        className="h-9 bg-white text-sm dark:bg-neutral-800"
      />
    </form>
  );
}
