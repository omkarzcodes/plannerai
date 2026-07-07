import { api } from "@/lib/api";
import type { BoardDetail, BoardSummary } from "@/types";

export async function listBoards(): Promise<BoardSummary[]> {
  const { data } = await api.get<{ boards: BoardSummary[] }>("/boards");
  return data.boards;
}

export async function getBoard(boardId: string): Promise<BoardDetail> {
  const { data } = await api.get<{ board: BoardDetail }>(`/boards/${boardId}`);
  return data.board;
}

export async function createBoard(title: string): Promise<BoardSummary> {
  const { data } = await api.post<{ board: BoardSummary }>("/boards", {
    title,
  });
  return data.board;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await api.delete(`/boards/${boardId}`);
}
