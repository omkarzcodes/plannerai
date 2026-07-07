import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listTodaySessions, logSession } from "./api";

export function useTodaySessions() {
  return useQuery({
    queryKey: ["pomodoro", "today"],
    queryFn: listTodaySessions,
  });
}

export function useLogSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pomodoro", "today"] }),
  });
}
