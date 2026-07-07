import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createBoard, deleteBoard, getBoard, listBoards } from "./api";

export function useBoards() {
  return useQuery({ queryKey: ["boards"], queryFn: listBoards });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
    enabled: Boolean(boardId),
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (title: string) => createBoard(title),
    onSuccess: (board) => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      navigate(`/boards/${board.id}`);
    },
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}
