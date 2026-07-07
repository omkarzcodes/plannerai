export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  tasks: Task[];
}

export interface BoardSummary {
  id: string;
  title: string;
}

export interface BoardDetail {
  id: string;
  title: string;
  columns: Column[];
}
