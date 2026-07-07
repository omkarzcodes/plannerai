import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import {
  useBoards,
  useCreateBoard,
  useDeleteBoard,
} from "@/features/boards/hooks";

export default function BoardsPage() {
  const { data: boards, isLoading } = useBoards();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  const [title, setTitle] = useState("");

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createBoard.mutate(trimmed);
    setTitle("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New board title"
          className="max-w-xs"
        />
        <Button type="submit" disabled={createBoard.isPending}>
          {createBoard.isPending ? "Creating…" : "Create board"}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : !boards || boards.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500">
              No boards yet. Create your first one above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="transition-colors hover:border-brand-300"
            >
              <CardContent className="flex items-center justify-between">
                <Link
                  to={`/boards/${board.id}`}
                  className="font-medium hover:text-brand-600"
                >
                  {board.title}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteBoard.mutate(board.id)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Delete
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
