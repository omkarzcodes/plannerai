import { useMutation, useQuery } from "@tanstack/react-query";
import { breakdownTask, getInsights, getSchedule } from "./api";

const FIVE_MIN = 5 * 60 * 1000;

export function useBreakdownTask() {
  return useMutation({ mutationFn: breakdownTask });
}

export function useSchedule() {
  return useQuery({
    queryKey: ["ai", "schedule"],
    queryFn: getSchedule,
    staleTime: FIVE_MIN,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: getInsights,
    staleTime: FIVE_MIN,
  });
}
