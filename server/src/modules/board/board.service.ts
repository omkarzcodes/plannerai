import { NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateBoardInput, UpdateBoardInput } from "./board.schemas.js";

const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"];

// Combines ownership + existence: non-owners simply get "not found".
export async function ensureBoardOwner(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    select: { id: true },
  });
  if (!board) throw new NotFoundError("Board not found");
  return board;
}

export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { columns: true } } },
  });
}

export async function getBoard(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: { tasks: { orderBy: { position: "asc" } } },
      },
    },
  });
  if (!board) throw new NotFoundError("Board not found");
  return board;
}

export async function createBoard(userId: string, input: CreateBoardInput) {
  return prisma.board.create({
    data: {
      title: input.title,
      userId,
      columns: {
        create: DEFAULT_COLUMNS.map((title, index) => ({
          title,
          position: index,
        })),
      },
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: { tasks: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export async function updateBoard(
  userId: string,
  boardId: string,
  input: UpdateBoardInput,
) {
  await ensureBoardOwner(userId, boardId);
  return prisma.board.update({
    where: { id: boardId },
    data: { title: input.title },
  });
}

export async function deleteBoard(userId: string, boardId: string) {
  await ensureBoardOwner(userId, boardId);
  await prisma.board.delete({ where: { id: boardId } });
}

export async function getBoardById(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: { orderBy: { position: "asc" } },
        },
      },
    },
  });
  if (!board) throw new NotFoundError("Board not found");
  return board;
}
