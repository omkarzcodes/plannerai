import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import type {
  LoginInput,
  RefreshInput,
  RegisterInput,
} from "./auth.schemas.js";

export async function register(req: Request, res: Response) {
  const result = await authService.registerUser(req.body as RegisterInput);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.loginUser(req.body as LoginInput);
  res.status(200).json(result);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as RefreshInput;
  const tokens = await authService.refreshTokens(refreshToken);
  res.status(200).json(tokens);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id);
  res.status(200).json({ user });
}
