import { api } from "@/lib/api";

/** Coerce any AI list item (string or object) into a safe display string. */
function toText(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    const val =
      o.title ?? o.step ?? o.task ?? o.name ?? o.text ?? o.description;
    return val == null ? "" : String(val);
  }
  return item == null ? "" : String(item);
}

export interface BreakdownInput {
  title: string;
  description?: string;
}

export async function breakdownTask(input: BreakdownInput): Promise<string[]> {
  const { data } = await api.post<{ subtasks?: unknown }>(
    "/ai/breakdown",
    input,
  );
  const raw = Array.isArray(data.subtasks) ? data.subtasks : [];
  return raw.map(toText).filter((s) => s.trim().length > 0);
}

export interface ScheduleItem {
  title: string;
  recommendation: string;
}

export async function getSchedule(): Promise<ScheduleItem[]> {
  const { data } = await api.get<{ schedule?: unknown }>("/ai/schedule");
  const raw = Array.isArray(data.schedule) ? data.schedule : [];
  return raw.map((item) => {
    const o = (item ?? {}) as Record<string, unknown>;
    return {
      title: toText(o.title ?? o.task),
      recommendation: toText(o.recommendation ?? o.suggestion ?? o.reason),
    };
  });
}

export interface Insights {
  summary: string;
  recommendations: string[];
}

export async function getInsights(): Promise<Insights> {
  const { data } = await api.get<{ insights?: Record<string, unknown> }>(
    "/ai/insights",
  );
  const insights = data.insights ?? {};
  const recs = Array.isArray(insights.recommendations)
    ? insights.recommendations
    : [];
  return {
    summary: toText(insights.summary),
    recommendations: recs.map(toText).filter((s) => s.trim().length > 0),
  };
}
