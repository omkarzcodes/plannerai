import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import { Spinner } from "@/components/ui/Spinner";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const BoardsPage = lazy(() => import("@/pages/BoardsPage"));
const BoardPage = lazy(() => import("@/pages/BoardPage"));
const PomodoroPage = lazy(() => import("@/pages/PomodoroPage"));
const AssistantPage = lazy(() => import("@/pages/AssistantPage"));

function PageFallback() {
  return (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes — redirect into the app if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected app — EVERYTHING here renders inside the AppLayout nav shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/boards" element={<BoardsPage />} />
            <Route path="/boards/:boardId" element={<BoardPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Route>
        </Route>

        {/* Anything else → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
