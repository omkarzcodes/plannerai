import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { ensureBoardOwner } from "../board/board.service.js";
import type {
  CreateColumnInput,
  ReorderColumnsInput,
  UpdateColumnInput,
} from "./column.schemas.js";

async function ensureColumnOwner(userId: string, columnId: string) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
  });
  if (!column) throw new NotFoundError("Column not found");
  return column;
}

export async function createColumn(
  userId: string,
  boardId: string,
  input: CreateColumnInput,
) {
  await ensureBoardOwner(userId, boardId);
  const count = await prisma.column.count({ where: { boardId } });
  return prisma.column.create({
    data: { title: input.title, boardId, position: count },
  });
}

export async function updateColumn(
  userId: string,
  columnId: string,
  input: UpdateColumnInput,
) {
  await ensureColumnOwner(userId, columnId);
  return prisma.column.update({
    where: { id: columnId },
    data: { title: input.title },
  });
}

export async function deleteColumn(userId: string, columnId: string) {
  await ensureColumnOwner(userId, columnId);
  await prisma.column.delete({ where: { id: columnId } });
}

export async function reorderColumns(
  userId: string,
  boardId: string,
  input: ReorderColumnsInput,
) {
  await ensureBoardOwner(userId, boardId);

  const columns = await prisma.column.findMany({
    where: { boardId },
    select: { id: true },
  });
  const validIds = new Set(columns.map((c) => c.id));
  const allValid = input.columnIds.every((id) => validIds.has(id));

  if (input.columnIds.length !== columns.length || !allValid) {
    throw new BadRequestError(
      "columnIds must include every column of this board exactly once",
    );
  }

  await prisma.$transaction(
    input.columnIds.map((id, index) =>
      prisma.column.update({ where: { id }, data: { position: index } }),
    ),
  );

  return prisma.column.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
  });
}
