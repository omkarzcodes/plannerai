import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import boardRoutes from "./modules/board/board.routes.js";
import columnRoutes from "./modules/column/column.routes.js";
import taskRoutes from "./modules/task/task.routes.js";
import healthRoutes from "./routes/health.routes.js";

import pomodoroRoutes from "./modules/pomodoro/pomodoro.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";

import morgan from "morgan";
// import { AppError } from "./lib/errors.js";

export const app = express();
app.set("trust proxy", 1);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // generous ceiling; your auth/ai limiters stay stricter
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// AI calls consume quota — keep them modest.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests, please slow down." },
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api", boardRoutes);
app.use("/api", columnRoutes);
app.use("/api", taskRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFoundHandler);
// app.use((req, _res, next) => {
//   next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`))
// })

app.use(errorHandler);

export default app;
