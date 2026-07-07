import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useOverview } from "@/features/analytics/hooks";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#94a3b8",
  MEDIUM: "#6366f1",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

// Hoisted so the JSX never uses double-brace ( ) object literals.
const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: -20 };
const BAR_CURSOR = { fill: "rgba(99, 102, 241, 0.08)" };
const LINE_DOT = { r: 3 };
const LINE_ACTIVE_DOT = { r: 5 };
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

function shortDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-xs text-neutral-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h2>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
      No data yet
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading, isError } = useOverview();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (isError || !overview) {
    return (
      <p className="text-sm text-red-600">Could not load your analytics.</p>
    );
  }

  const completedData = overview.tasksCompletedPerDay.map((d) => ({
    ...d,
    label: shortDay(d.date),
  }));
  const focusData = overview.focusMinutesPerDay.map((d) => ({
    ...d,
    label: shortDay(d.date),
  }));
  const priorityData = overview.tasksByPriority
    .filter((p) => p.count > 0)
    .map((p) => ({ ...p, fill: PRIORITY_COLORS[p.priority] ?? "#6366f1" }));
  const focusTotal = focusData.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Tasks completed"
          value={overview.taskStatus.completed}
        />
        <StatCard label="Tasks pending" value={overview.taskStatus.pending} />
        <StatCard label="Focus minutes (7d)" value={focusTotal} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tasks completed (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completedData} margin={CHART_MARGIN}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <Tooltip cursor={BAR_CURSOR} />
              <Bar
                dataKey="count"
                name="Completed"
                fill="#6366f1"
                radius={BAR_RADIUS}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Focus minutes (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={focusData} margin={CHART_MARGIN}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="minutes"
                name="Minutes"
                stroke="#6366f1"
                strokeWidth={2}
                dot={LINE_DOT}
                activeDot={LINE_ACTIVE_DOT}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by priority">
          {priorityData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
