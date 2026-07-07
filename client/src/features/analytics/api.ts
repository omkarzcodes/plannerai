import { api } from '@/lib/api'

export interface AnalyticsOverview {
  tasksCompletedPerDay: { date: string; count: number }[]
  focusMinutesPerDay: { date: string; minutes: number }[]
  tasksByPriority: { priority: string; count: number }[]
  taskStatus: { completed: number; pending: number }
}

export async function getOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<{ overview: AnalyticsOverview }>('/analytics/overview')
  return data.overview
}